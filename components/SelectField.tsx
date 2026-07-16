import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type SelectOption = { label: string; value: string };

type SingleSelectProps = {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  multiple?: false;
};

type MultiSelectProps = {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  multiple: true;
};

type SelectFieldProps = SingleSelectProps | MultiSelectProps;

/**
 * Minimal modal-based picker — no picker library is installed in this
 * project, and adding one for a handful of admin forms wasn't worth the
 * new dependency. Handles both single-select (class/parent-role pickers)
 * and multi-select (linking multiple children to a parent).
 */
export default function SelectField(props: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const { label, placeholder, options } = props;

  let displayText: string;
  let isEmpty: boolean;

  if (props.multiple) {
    const selectedLabels = options
      .filter((o) => props.value.includes(o.value))
      .map((o) => o.label);
    displayText = selectedLabels.length
      ? selectedLabels.join(", ")
      : placeholder || "Select…";
    isEmpty = props.value.length === 0;
  } else {
    const selectedLabel = options.find((o) => o.value === props.value)?.label;
    displayText = selectedLabel || placeholder || "Select…";
    isEmpty = !props.value;
  }

  const toggleOption = (optionValue: string) => {
    if (props.multiple) {
      const next = props.value.includes(optionValue)
        ? props.value.filter((v) => v !== optionValue)
        : [...props.value, optionValue];
      props.onChange(next);
    } else {
      props.onChange(optionValue);
      setOpen(false);
    }
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.field} onPress={() => setOpen(true)}>
        <Text style={[styles.fieldText, isEmpty && styles.placeholderText]}>
          {displayText}
        </Text>
        <Icon name="chevron-down" size={20} color="#6b7280" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              style={{ maxHeight: 320 }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No options available.</Text>
              }
              renderItem={({ item }) => {
                const selected = props.multiple
                  ? props.value.includes(item.value)
                  : props.value === item.value;
                return (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => toggleOption(item.value)}
                  >
                    <Text style={styles.optionText}>{item.label}</Text>
                    {selected && (
                      <Icon name="check" size={20} color="#2563eb" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
            {props.multiple && (
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setOpen(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    marginBottom: 6,
    marginTop: 10,
    color: "#374151",
    fontWeight: "600",
  },
  field: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldText: {
    fontSize: 15,
    color: "#111827",
    flexShrink: 1,
  },
  placeholderText: {
    color: "#9ca3af",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    maxHeight: "70%",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1f2937",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  optionText: {
    fontSize: 15,
    color: "#111827",
  },
  emptyText: {
    color: "#6b7280",
    paddingVertical: 12,
  },
  doneButton: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
