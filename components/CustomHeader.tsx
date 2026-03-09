import { StudentwithStringDate } from "@/app/store/slices/auth.type";
import { HeaderTitleProps } from "@react-navigation/elements";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { AppState } from "../app/store/store";

const CustomHeader = (props: HeaderTitleProps) => {
  const studentInfo = useSelector(
    (state: AppState) => state.auth.userInfo,
  ) as StudentwithStringDate;
  console.log("CustomHeader rendered | userInfo from store = ", studentInfo);

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
      <Text style={{ fontWeight: "600", display: "flex" }}>Page Title</Text>
      <Text style={{ fontWeight: "600", display: "flex" }}></Text>
      <Text style={{ fontWeight: "600", display: "flex" }}>
        {studentInfo.fullname || "No Student info"}
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
