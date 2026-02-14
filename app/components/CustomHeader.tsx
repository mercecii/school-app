import { Text, View } from "react-native";
import { auth } from "./../firebaseSetup/firebaseSetup";
export default function CustomHeader() {
  console.log("CustomHeader rendered | auth = ", auth);
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
      {/* LEFT SIDE → Hamburger */}
      {/* <TouchableOpacity
        onPress={(e) => {
          console.log("event fire", e);
          navigation.dispatch(DrawerActions.toggleDrawer());
        }}
      >
        <Text style={{ fontSize: 40, fontWeight: "bold" }}>☰</Text>
      </TouchableOpacity> */}

      {/* CENTER → Title */}

      <Text style={{ fontSize: 18, fontWeight: "600", display: "flex" }}>
        SSR Juniors
      </Text>
      <Text style={{ fontSize: 18, fontWeight: "600", display: "flex" }}>
        {auth?.currentUser?.email || "No user logged in"}
      </Text>

      {/* RIGHT SIDE → Placeholder (notifications/logout later) */}
      {/* <View style={{ width: 24 }} /> */}
    </View>
  );
}
