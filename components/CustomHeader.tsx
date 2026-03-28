import {
  AdminWithStringDate,
  StudentwithStringDate,
} from "@/store/slices/auth.type";
import { HeaderTitleProps } from "@react-navigation/elements";
import { Text, View } from "react-native";
import { AppState, useAppSelector } from "../store/store";

const CustomHeader = (props: HeaderTitleProps) => {
  const { userInfo, role } = useAppSelector((state: AppState) => state.auth);
  const studentInfo =
    role === "student" ? (userInfo as StudentwithStringDate) : null;
  const adminInfo = role === "admin" ? (userInfo as AdminWithStringDate) : null;
  const screenTitle = typeof props.children === "string" ? props.children : "";

  return (
    <View
      style={{
        flexGrow: 1,
        alignSelf: "stretch",
        backgroundColor: "smokewhite",
        paddingHorizontal: 0,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontWeight: "600" }}>{screenTitle}</Text>
      {studentInfo && (
        <Text style={{ fontWeight: "600" }}>
          {(studentInfo.fullname || "No Student info") +
            " · CLASS - " +
            (studentInfo.class ?? "") +
            (studentInfo.section ?? "")}
        </Text>
      )}
      {adminInfo && (
        <Text style={{ fontWeight: "600" }}>
          {adminInfo.fullName || "No Admin info"}
        </Text>
      )}
    </View>
  );
};

export default CustomHeader;
