import { StudentwithStringDate } from "@/store/slices/auth.type";
import { HeaderTitleProps } from "@react-navigation/elements";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { AppState } from "../store/store";

const CustomHeader = (props: HeaderTitleProps) => {
  const studentInfo = useSelector(
    (state: AppState) => state.auth.userInfo,
  ) as StudentwithStringDate;
  console.log("CustomHeader rendered | userInfo from store = ", studentInfo);

  return (
    <View
      style={{
        flexGrow: 1,
        alignSelf: "stretch",
        backgroundColor: "red",
        paddingHorizontal: 16,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* <Text style={{ fontWeight: "600" }}>Page Title</Text> */}

      <Text style={{ fontWeight: "600" }}>
        {(studentInfo && studentInfo.fullname) || "No Student info"}
      </Text>
      <Text style={{ fontWeight: "600" }}>
        {" "}
        {"CLASS  - " + studentInfo.class + studentInfo.section}
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
