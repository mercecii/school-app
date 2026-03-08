import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";
export default function Homework() {
  const [selectedDate, setSelectedDate] = useState<string>("");

  return (
    <View style={styles.container}>
      <Calendar
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
});
