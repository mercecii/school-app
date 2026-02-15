import { Redirect, useSegments } from "expo-router";

import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "./firebaseSetup/firebaseSetup";

const Index = () => {
  const [userRole, setUserRole] = useState<string>("");
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
      } else if (studentsDoc.exists()) {
        return "student";
      }
      return "";
    } catch (e) {
      console.error("Error fetching user role:", e);
      return "";
    }
  };
  console.log("eee: app/index.tsx");
  useEffect(() => {
    console.log("Firebase Auth:", auth);
  }, []);

  console.log("Segments:", segments);
  const isInsideAuthRouteSegment = segments[0] === "(auth)";
  getRoleAsync(user?.uid || "").then((role) => {
    console.log("Fetched user role:", role);
    setUserRole(role);
  });

  console.log("Current user:", user);
  console.log("User role state:", userRole);
  if (!user && !isInsideAuthRouteSegment) {
    console.log("User not logged in, redirecting to login page.");
    return <Redirect href="/(auth)/login" />;
  }
  if (user && userRole === "admin") {
    console.log("User is admin, redirecting to admin page.");
    return <Redirect href="/admin" />;
  }
  if (user && userRole === "student") {
    console.log("redirecting from app/index.tsx");
    return <Redirect href="/pages/dashboard" />;
  }
};

export default Index;
