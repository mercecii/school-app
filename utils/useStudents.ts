import { StudentDoc } from "@/firebaseSetup/fireBase.types";
import { firestore } from "@/firebaseSetup/firebaseSetup";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

export type StudentOption = {
  id: string;
  label: string;
  classId: string;
};

/** Live list of active students, for admin pickers (link-to-parent, etc). */
export function useStudentOptions(): StudentOption[] {
  const [students, setStudents] = useState<StudentOption[]>([]);

  useEffect(() => {
    const q = query(collection(firestore, "students"), where("isActive", "==", true));
    const unsubscribe = onSnapshot(q, (snap) => {
      const options = snap.docs
        .map((d) => {
          const data = d.data() as StudentDoc;
          return {
            id: d.id,
            label: `${data.fullName} (Roll ${data.rollNumber})`,
            classId: data.classId,
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
      setStudents(options);
    });
    return unsubscribe;
  }, []);

  return students;
}
