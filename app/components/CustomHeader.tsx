import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { auth, db } from "./../firebaseSetup/firebaseSetup";

const CustomHeader = () => {
  console.log("CustomHeader rendered | auth = ", auth);

  const [fullname, setFullname] = useState("");

  useEffect(() => {
    const fetchFullname = async () => {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const userDoc = doc(db, "students", uid);
        console.log("userDoc", userDoc);
        const docSnap = await getDoc(userDoc);
        console.log("docSnap", docSnap);
        if (docSnap.exists()) {
          console.log("docsnap.data()    fetched:", docSnap.data());
          setFullname(docSnap.data().fullname || "");
        }
      }
    };
    fetchFullname();
  }, []);
  return (
    <View
      style={{
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        elevation: 4,
      }}
    >
      <Text style={{ fontWeight: "600", display: "flex" }}>SSR Juniors</Text>
      <Text style={{ fontWeight: "600", display: "flex" }}>
        {/* {auth?.currentUser?.email || "No user logged in"} */}
        {auth?.currentUser ? (
          <Text style={{ color: "blue", marginLeft: 8 }}>{fullname}</Text>
        ) : null}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
  },
  title: {
    fontWeight: "600",
    fontSize: 18,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    color: "blue",
    marginLeft: 8,
  },
});

export default CustomHeader;
