import { firestore } from "@/firebaseSetup/firebaseSetup";
import { doc, getDoc } from "firebase/firestore";

export const getRoleAsync = async (uid: string) => {
  try {
    console.log("getRoleAsync called with uid:", uid);
    const studentsDoc = await getDoc(doc(firestore, "students", uid));
    const adminsDoc = await getDoc(doc(firestore, "admins", uid));
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
