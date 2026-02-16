import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { AppState } from "../store/store";
import { auth } from "./../firebaseSetup/firebaseSetup";

const CustomHeader = () => {
  console.log("CustomHeader rendered | auth = ", auth);
  const { userInfo } = useSelector((state: AppState) => state.auth);
  console.log("CustomHeader rendered | auth.currentUser = ", userInfo);

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
        {auth?.currentUser?.email || "No user logged in"}
      </Text>
      <Text style={{ fontWeight: "600", display: "flex" }}>
        {userInfo?.fullName || "No user info"}
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
