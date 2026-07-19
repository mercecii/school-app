import { ClassDoc } from "@/firebaseSetup/fireBase.types";
import { firestore } from "@/firebaseSetup/firebaseSetup";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

export type ClassOption = { id: string; label: string };

/** Live list of active classes, for select pickers across admin/teacher screens. */
export function useClassOptions(): ClassOption[] {
  const [classes, setClasses] = useState<ClassOption[]>([]);

  useEffect(() => {
    const q = query(collection(firestore, "classes"), where("isActive", "==", true));
    const unsubscribe = onSnapshot(q, (snap) => {
      const options = snap.docs
        .map((d) => {
          const data = d.data() as ClassDoc;
          return { id: d.id, label: data.name };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
      setClasses(options);
    });
    return unsubscribe;
  }, []);

  return classes;
}
