import NotRegisteredScreen from "@/components/NotRegisteredScreen";
import {
  AdminDoc,
  ParentDoc,
  StudentDoc,
  TeacherDoc,
} from "@/firebaseSetup/fireBase.types";
import { waitForAuthz } from "@/utils/authzReady";
import {
  resolvePhoneLoginRole,
  ResolvePhoneLoginResult,
} from "@/utils/phoneRoleAdoption";
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getLastNotificationResponseAsync,
} from "expo-notifications";
import { Redirect, Slot, useRouter, useSegments } from "expo-router";
import {
  arrayUnion,
  doc,
  documentId,
  getDoc,
  getDocs,
  collection as firestoreCollection,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Provider, useSelector } from "react-redux";
import { firestore } from "../firebaseSetup/firebaseSetup";
import { setChildren, setRole, setUser } from "../store/slices/authSlice";
import { AppState, store, useAppDispatch } from "../store/store";
import type { AuthUser } from "../utils/authClient";
import {
  auth,
  ensureFirestoreSession,
  onAuthStateChanged,
  signOut,
} from "../utils/authClient";
import {
  configureNotificationHandlingAsync,
  registerForPushNotificationsAsync,
} from "../utils/utils";

// Load fonts for web
if (Platform.OS === "web") {
  require("../public/fonts.css");
}

type Role = "admin" | "teacher" | "parent";

type GateState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "not-registered" }
  // Adopted (or already adopted), waiting on the Cloud Function fan-out
  // that populates authz/{uid} before any authz-gated read will succeed.
  | { status: "provisioning" }
  | { status: "provisioning-timeout" }
  | { status: "link-error"; message: string }
  | { status: "ready"; role: Role };

function timestampToString(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return "";
}

async function fetchChildren(childStudentIds: string[]) {
  if (!childStudentIds.length) return [];

  // documentId() 'in' queries cap at 30 values — plenty for one family.
  const snap = await getDocs(
    query(
      firestoreCollection(firestore, "students"),
      where(documentId(), "in", childStudentIds.slice(0, 30)),
    ),
  );

  return snap.docs.map((d) => {
    const data = d.data() as StudentDoc;
    return {
      ...data,
      id: d.id,
      createdAt: timestampToString(data.createdAt),
      updatedAt: timestampToString(data.updatedAt),
    };
  });
}

export default function RootLayout() {
  console.log("RootLayout rendered");
  return (
    <Provider store={store}>
      <AuthGate />
    </Provider>
  );
}

function AuthGate() {
  const segments = useSegments();
  const { role } = useSelector((state: AppState) => state.auth);
  const [gate, setGate] = useState<GateState>({ status: "loading" });
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    configureNotificationHandlingAsync().catch((error) => {
      console.error("❌ Failed to configure notifications on startup:", error);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u: AuthUser | null) => {
      console.log("Auth state changed, user:", u);

      if (u === undefined) return;

      if (!u) {
        dispatch(setUser(null));
        dispatch(setRole(null));
        dispatch(setChildren([]));
        setGate({ status: "unauthenticated" });
        return;
      }

      setGate({ status: "loading" });
      const uid = u.uid;
      console.log("Restoring session for UID:", uid);

      try {
        // Must resolve before any Firestore call below — see
        // utils/authClient.native.ts and firebaseSetup.ts's `webAuth`.
        await ensureFirestoreSession(u);

        // 1. Admin — UID-keyed, resolved directly, no phone-adopt/authz wait.
        const adminSnap = await getDoc(doc(firestore, "admins", uid));
        if (adminSnap.exists()) {
          const adminData = adminSnap.data() as AdminDoc;
          dispatch(setRole("admin"));
          dispatch(setChildren([]));
          dispatch(
            setUser({
              ...adminData,
              createdAt: timestampToString(adminData.createdAt),
              updatedAt: timestampToString(adminData.updatedAt),
              lastLoginAt: timestampToString(adminData.lastLoginAt),
            }),
          );
          setGate({ status: "ready", role: "admin" });
          if (Platform.OS !== "web") {
            registerForPushNotificationsAsync("admins", uid).catch((error) => {
              console.error("❌ Push registration failed (admin):", error);
            });
          }
          return;
        }

        // 2. Teacher, then 3. Parent — phone-adopted, auto-ID. First match
        // wins (dual-role tie-break not yet resolved — see docs/decisions.md).
        const teacherResult = await resolvePhoneLoginRole<TeacherDoc>(
          "teachers",
          u,
        );
        if (teacherResult.status !== "not-found") {
          await handlePhoneRoleResult("teachers", teacherResult, uid);
          return;
        }

        const parentResult = await resolvePhoneLoginRole<ParentDoc>(
          "parents",
          u,
        );
        if (parentResult.status !== "not-found") {
          await handlePhoneRoleResult("parents", parentResult, uid);
          return;
        }

        // Auth user exists but no matching Firestore profile anywhere.
        dispatch(setUser(null));
        dispatch(setRole(null));
        dispatch(setChildren([]));
        setGate({ status: "not-registered" });
      } catch (error) {
        console.error("❌ Failed to restore session:", error);
        setGate({
          status: "link-error",
          message:
            "Something went wrong while signing you in. Please try again.",
        });
      }
    });

    async function handlePhoneRoleResult(
      collectionName: "teachers" | "parents",
      result: ResolvePhoneLoginResult<TeacherDoc | ParentDoc>,
      uid: string,
    ) {
      if (result.status === "already-adopted-by-other-account") {
        setGate({
          status: "link-error",
          message:
            "This phone number is already linked to a different account. Contact the school admin.",
        });
        return;
      }
      if (result.status !== "resolved") return; // not-found handled by caller

      setGate({ status: "provisioning" });
      const authzReady = await waitForAuthz(uid);
      if (!authzReady) {
        setGate({ status: "provisioning-timeout" });
        return;
      }

      const role: Role = collectionName === "teachers" ? "teacher" : "parent";
      const data = result.data;

      if (role === "parent") {
        const parentData = data as ParentDoc;
        const children = await fetchChildren(parentData.childStudentIds ?? []);
        dispatch(setChildren(children));
      } else {
        dispatch(setChildren([]));
      }

      dispatch(setRole(role));
      dispatch(
        setUser({
          ...data,
          id: result.id,
          createdAt: timestampToString((data as any).createdAt),
          updatedAt: timestampToString((data as any).updatedAt),
          lastLoginAt: (data as any).lastLoginAt
            ? timestampToString((data as any).lastLoginAt)
            : null,
        } as any),
      );
      setGate({ status: "ready", role });

      if (Platform.OS !== "web") {
        registerForPushNotificationsAsync(collectionName, result.id).catch(
          (error) => {
            console.error(`❌ Push registration failed (${role}):`, error);
          },
        );
      }
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (gate.status !== "ready") return; // wait until auth + layout is ready

    // Web does not support getLastNotificationResponseAsync
    if (Platform.OS === "web") {
      return;
    }

    const foregroundSubscription = addNotificationReceivedListener(
      (notification) => {
        console.log("🔔 Foreground notification received:", {
          title: notification.request.content.title,
          body: notification.request.content.body,
          data: notification.request.content.data,
        });
      },
    );

    const responseSubscription = addNotificationResponseReceivedListener(
      (response) => {
        console.log("📨 Notification response received:", {
          actionIdentifier: response.actionIdentifier,
          data: response.notification.request.content.data,
        });
        handleNotification(response);
      },
    );

    const checkInitial = async () => {
      const response = await getLastNotificationResponseAsync();
      if (response) {
        console.log("📬 Found initial notification response:", {
          data: response.notification.request.content.data,
        });
        handleNotification(response);
      }
    };

    checkInitial();

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, [gate.status]);

  const handleNotification = async (response: any) => {
    const data = response.notification.request.content.data;
    console.log("handleNotofication: response = ", response);
    const id = data?.notificationId;

    if (id && auth.currentUser) {
      await updateDoc(doc(firestore, "notifications", id), {
        readBy: arrayUnion(auth.currentUser.uid),
      });
    }
    // Delay navigation until after layout is fully mounted
    requestAnimationFrame(() => {
      if (data?.screen === "notifications" && role === "parent") {
        router.replace("/pages/notifications");
      }
    });
  };

  if (gate.status === "loading" || gate.status === "provisioning") {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        {gate.status === "provisioning" && (
          <Text style={styles.provisioningText}>Setting up your account…</Text>
        )}
      </View>
    );
  }

  if (gate.status === "not-registered") {
    return <NotRegisteredScreen />;
  }

  if (gate.status === "link-error" || gate.status === "provisioning-timeout") {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>
          {gate.status === "provisioning-timeout"
            ? "Account setup is taking longer than expected"
            : "Account linking issue"}
        </Text>
        <Text style={styles.errorMessage}>
          {gate.status === "provisioning-timeout"
            ? "Please try again in a moment."
            : gate.message}
        </Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => signOut(auth).catch(() => undefined)}
        >
          <Text style={styles.retryButtonText}>Sign out and try again</Text>
        </Pressable>
      </View>
    );
  }

  const topSegment = segments[0];
  const isAuthRoute = topSegment === "(auth)";
  const isAdminRoute = topSegment === "admin";
  const isTeacherRoute = topSegment === "teacher";
  const isParentRoute = topSegment === "pages";

  if (gate.status === "unauthenticated" && !isAuthRoute) {
    console.log("Redirecting to login because user is not authenticated");
    return <Redirect href="/(auth)/login" />;
  }

  if (gate.status === "ready") {
    if (gate.role === "admin" && !isAdminRoute) {
      return <Redirect href="/admin" />;
    }
    if (gate.role === "teacher" && !isTeacherRoute) {
      return <Redirect href="/teacher" />;
    }
    if (gate.role === "parent" && !isParentRoute) {
      return <Redirect href="/pages" />;
    }
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  provisioningText: {
    marginTop: 12,
    fontSize: 14,
    color: "#4B5563",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 15,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
