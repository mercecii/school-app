import {
  AdminWithStringDate,
  ParentWithStringDate,
  TeacherWithStringDate,
} from "@/store/slices/auth.type";
import { HeaderTitleProps } from "@react-navigation/elements";
import { Text, View } from "react-native";
import { AppState, useAppSelector } from "../store/store";

const CustomHeader = (props: HeaderTitleProps) => {
  const { userInfo, role, children, selectedChildId } = useAppSelector(
    (state: AppState) => state.auth,
  );
  const adminInfo = role === "admin" ? (userInfo as AdminWithStringDate) : null;
  const teacherInfo =
    role === "teacher" ? (userInfo as TeacherWithStringDate) : null;
  const parentInfo =
    role === "parent" ? (userInfo as ParentWithStringDate) : null;
  const selectedChild = children.find((c) => c.id === selectedChildId);
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
      {adminInfo && (
        <Text style={{ fontWeight: "600" }}>
          {adminInfo.fullName || "No Admin info"}
        </Text>
      )}
      {teacherInfo && (
        <Text style={{ fontWeight: "600" }}>
          {teacherInfo.fullName || "No Teacher info"}
        </Text>
      )}
      {parentInfo && (
        <Text style={{ fontWeight: "600" }}>
          {selectedChild
            ? `${selectedChild.fullName} · CLASS - ${selectedChild.classId}`
            : parentInfo.fullName || "No Parent info"}
        </Text>
      )}
    </View>
  );
};

export default CustomHeader;
