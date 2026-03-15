import { StudentwithStringDate } from "@/store/slices/auth.type";
import { HeaderTitleProps } from "@react-navigation/elements";
import { Text, View } from "react-native";
import { AppState, useAppSelector } from "../store/store";

const CustomHeader = (props: HeaderTitleProps) => {
  const studentInfo = useAppSelector(
    (state: AppState) => state.auth.userInfo,
  ) as StudentwithStringDate;
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
    </View>
  );
};

export default CustomHeader;
