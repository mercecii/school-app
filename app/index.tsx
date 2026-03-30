import { Redirect, useSegments } from "expo-router";

import { getRoleAsync } from "@/utils/getRoleAsync";
import React, { useEffect, useState } from "react";
import { auth } from "../utils/authClient";

const Index = () => {
  const [userRole, setUserRole] = useState<string>("");
  const segments = useSegments();
  const user = auth.currentUser;

  console.log("eee: app/index.tsx");

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
    return <Redirect href="/pages" />;
  }
};

export default Index;
