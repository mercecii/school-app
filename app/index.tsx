import { Redirect, useSegments } from "expo-router";

import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { auth, db } from "./firebaseSetup/firebaseSetup";

const Index = () => {
  const [userRole, setUserRole] = useState<string>("student");
  const segments = useSegments();
  const user = auth.currentUser;

  console.log("eee: app/index.tsx");
  const getRoleAsync = async (uid: string) => {
    try {
      console.log("getRoleAsync called with uid:", uid);
      const studentsDoc = await getDoc(doc(db, "students", uid));
      const adminsDoc = await getDoc(doc(db, "admins", uid));
      console.log({ studentsDoc, adminsDoc });
      // return doc.data()?.role || "user";
      console.log("Admin doc exists:", adminsDoc.exists());
      if (adminsDoc.exists()) {
        return "admin";
      }
      return "student";
    } catch (e) {
      console.error("Error fetching user role:", e);
      return "student";
    }
  };
  console.log("eee: app/index.tsx");
  useEffect(() => {
    console.log("Firebase Auth:", auth);
  }, []);

  console.log("Segments:", segments);
  const isInsideAuthRouteSegment = segments[0] === "(auth)";

  // If not logged in and NOT already on login → redirect to login
  if (!user && !isInsideAuthRouteSegment) {
    console.log("User not logged in, redirecting to login page.");
    return <Redirect href="/(auth)/login" />;
  }

  // If logged in and currently in auth → redirect to pages
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "red",
  },
});

export default Index;
