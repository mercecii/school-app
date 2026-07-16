import { AppState, useAppSelector } from "@/store/store";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";

export default function CalendarScreen() {
  const { children, selectedChildId } = useAppSelector(
    (state: AppState) => state.auth,
  );
  const selectedChild = children.find((c) => c.id === selectedChildId);

  const [selectedDate, setSelectedDate] = useState<string>("");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CALENDAR</Text>
        <Text style={styles.headerSubtitle}>
          {selectedChild?.fullName || "Select a child from Dashboard"}
        </Text>
      </View>

      <Calendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
        markedDates={{
          ...(selectedDate
            ? { [selectedDate]: { selected: true, selectedColor: "#e53935" } }
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
