import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState("");

  const markedDates = {
    "2026-02-24": {
      selected: true,
      selectedColor: "#E53935", // Absent (Red)
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Calendar Section */}
        <Calendar
          current={"2026-02-01"}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          theme={{
            todayTextColor: "#2196F3",
            arrowColor: "#2196F3",
          }}
        />

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Legend color="#1E88E5" label="Present" />
          <Legend color="#E53935" label="Absent" />
          <Legend color="#FDD835" label="Leave" />
        </View>

        {/* Attendance Summary Header */}
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryHeaderText}>% Attendance</Text>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.monthTitle}>Feb 2026</Text>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Working Days</Text>
              <Text style={styles.blueValue}>0</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.column}>
              <Text style={styles.label}>Present</Text>
              <Text style={styles.blueValue}>0</Text>
            </View>
          </View>

          <View style={styles.absentContainer}>
            <Text style={styles.label}>Absent</Text>
            <Text style={styles.redValue}>0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
  },
  summaryHeader: {
    backgroundColor: "#E53935",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  summaryHeaderText: {
    color: "#fff",
    fontWeight: "bold",
  },
  summaryCard: {
    padding: 20,
  },
  monthTitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
    color: "#E53935",
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: "#ccc",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  blueValue: {
    fontSize: 28,
    color: "#1E88E5",
    fontWeight: "bold",
  },
  redValue: {
    fontSize: 28,
    color: "#E53935",
    fontWeight: "bold",
  },
  absentContainer: {
    marginTop: 25,
    alignItems: "center",
  },
});
