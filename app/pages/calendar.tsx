import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Calendar as RNCalendar } from "react-native-calendars";
import { useUser } from "../(context)/UserContext";

export default function CalendarScreen() {
  const user = useUser();
  const [selectedDate, setSelectedDate] = useState<string>("");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CALENDAR</Text>
        <Text style={styles.headerSubtitle}>
          {user?.fullName || "Student Name"} CLASS-{user?.class || ""}
        </Text>
      </View>

      {/* Calendar Component */}
      <RNCalendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
        markedDates={{
          ...(selectedDate
            ? {
                [selectedDate]: {
                  selected: true,
                  selectedColor: "#e53935",
                },
              }
            : {}),
        }}
        theme={{
          todayTextColor: "#4a90e2",
          arrowColor: "#4a90e2",
          monthTextColor: "#333",
          textDayFontWeight: "500",
          textMonthFontWeight: "700",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    backgroundColor: "#4a90e2",
    paddingVertical: 20,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#fff",
    marginTop: 4,
    fontSize: 14,
  },
});
