import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/authcontext";

import {
  getHabitsFromFirebase,
  addHabitToFirebase,
} from "../services/habitservices";

import { checkDuplicateHabit } from "../Utils/habitlogic";
import { AnimatedPressable } from "../components/AnimatedPressable";

const categories = [
  "Study",
  "Fitness",
  "Health",
  "Coding",
  "Reading",
  "Personal",
  "Other",
];

const priorities = ["Low", "Medium", "High"];

const emojis = [
  "📚",
  "💪",
  "🥗",
  "💻",
  "📖",
  "🧘",
  "🎯",
  "⭐",
  "💧",
  "🏃",
];

const habitColors = [
  "#4F46E5",
  "#16A34A",
  "#EA580C",
  "#DC2626",
  "#9333EA",
  "#0891B2",
  "#F59E0B",
];

const times = [
  "07:00 AM",
  "08:00 AM",
  "09:00 AM",
  "12:00 PM",
  "06:00 PM",
  "09:00 PM",
];

export default function AddHabitScreen() {
  const { colors: themeColors } = useTheme();
  const { user } = useAuth();

  const [habitName, setHabitName] = useState("");
  const [description, setDescription] = useState("");

  // Duration added
  const [duration, setDuration] = useState("");

  const [category, setCategory] = useState("Study");
  const [priority, setPriority] = useState("Medium");

  const [selectedEmoji, setSelectedEmoji] = useState("🎯");
  const [selectedColor, setSelectedColor] = useState(habitColors[0]);

  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("08:00 AM");

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddHabit = async () => {
    // 1. Check habit name
    if (!habitName.trim()) {
      setError("Please enter a habit name.");
      return;
    }

    // 2. Check minimum length
    if (habitName.trim().length < 2) {
      setError("Habit name must be at least 2 characters.");
      return;
    }

    // 3. Check duration
    if (!duration.trim()) {
      setError("Please enter habit duration.");
      return;
    }

    // 4. Check duration value
    if (Number(duration) <= 0 || isNaN(Number(duration))) {
      setError("Duration must be greater than 0.");
      return;
    }

    // 5. Prevent multiple clicks
    if (isSaving) {
      return;
    }

    // 6. Check Firebase user
    if (!user) {
      Alert.alert(
        "Login Required",
        "Please login before creating a habit."
      );
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      // Get current user's habits from Firebase
      const oldHabits = await getHabitsFromFirebase(user.uid);

      // Check duplicate habit
      const isDuplicate = checkDuplicateHabit(
        oldHabits,
        habitName
      );

      if (isDuplicate) {
        setError(
          "A habit with this name already exists! Please choose a unique name."
        );

        setIsSaving(false);
        return;
      }

      // Create new habit
      const newHabit = {
        name: habitName.trim(),

        description: description.trim(),

        // Duration in hours
        duration: Number(duration),

        category,

        priority,

        icon: selectedEmoji,

        color: selectedColor,

        reminderEnabled,

        reminderTime: reminderEnabled
          ? reminderTime
          : null,

        completed: false,

        streak: 0,

        bestStreak: 0,

        completedDates: [],

        createdAt: new Date().toISOString(),
      };

      // Save habit to Firebase Firestore
      await addHabitToFirebase(
        user.uid,
        newHabit
      );

      Alert.alert(
        "Success",
        "Habit created successfully!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/"),
          },
        ]
      );
    } catch (err) {
      console.log("Error creating habit:", err);

      Alert.alert(
        "Error",
        "Something went wrong while creating the habit."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: themeColors.background,
        },
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title */}

      <Text
        style={[
          styles.title,
          {
            color: themeColors.textPrimary,
          },
        ]}
      >
        Create New Habit
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color: themeColors.textSecondary,
          },
        ]}
      >
        Set up goals, custom reminders, and categories.
      </Text>

      {/* Habit Name */}

      <Text
        style={[
          styles.label,
          {
            color: themeColors.textPrimary,
          },
        ]}
      >
        Habit Name *
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: themeColors.surface,
            borderColor: error
              ? themeColors.danger
              : themeColors.cardBorder,
            color: themeColors.textPrimary,
          },
        ]}
        placeholder="e.g. Read 20 pages daily"
        placeholderTextColor={themeColors.textMuted}
        value={habitName}
        onChangeText={(text) => {
          setHabitName(text);
          setError("");
        }}
        autoCapitalize="sentences"
      />

      {/* Error */}

      {error !== "" && (
        <View style={styles.errorRow}>
          <Ionicons
            name="alert-circle"
            size={16}
            color={themeColors.danger}
          />

          <Text
            style={[
              styles.error,
              {
                color: themeColors.danger,
              },
            ]}
          >
            {error}
          </Text>
        </View>
      )}

      {/* Description */}

      <Text
        style={[
          styles.label,
          {
            color: themeColors.textPrimary,
          },
        ]}
      >
        Description (Optional)
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.textArea,
          {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.cardBorder,
            color: themeColors.textPrimary,
          },
        ]}
        placeholder="Why do you want to build this habit?"
        placeholderTextColor={themeColors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      {/* Duration */}

      <Text
        style={[
          styles.label,
          {
            color: themeColors.textPrimary,
          },
        ]}
      >
        Duration (Hours) *
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.cardBorder,
            color: themeColors.textPrimary,
          },
        ]}
        placeholder="e.g. 3"
        placeholderTextColor={themeColors.textMuted}
        value={duration}
        onChangeText={(text) => {
          setDuration(text);
          setError("");
        }}
        keyboardType="numeric"
      />

      {/* Reminder */}

      <Text
        style={[
          styles.label,
          {
            color: themeColors.textPrimary,
          },
        ]}
      >
        Reminder & Schedule
      </Text>

      <View
        style={[
          styles.reminderCard,
          {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.cardBorder,
          },
        ]}
      >
        <View style={styles.reminderToggleRow}>
          <View style={styles.iconTextGroup}>
            <Ionicons
              name="alarm-outline"
              size={22}
              color={themeColors.primary}
            />

            <Text
              style={[
                styles.reminderLabel,
                {
                  color: themeColors.textPrimary,
                },
              ]}
            >
              Enable Daily Reminder
            </Text>
          </View>

          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{
              false: themeColors.cardBorder,
              true: themeColors.primary,
            }}
            thumbColor="#FFFFFF"
          />
        </View>

        {reminderEnabled && (
          <View style={{ marginTop: 12 }}>
            <Text
              style={[
                styles.subLabel,
                {
                  color: themeColors.textSecondary,
                },
              ]}
            >
              Select Reminder Time:
            </Text>

            <View style={styles.timeOptionsRow}>
              {times.map((time) => {
                const isSelected =
                  reminderTime === time;

                return (
                  <AnimatedPressable
                    key={time}
                    style={[
                      styles.timeChip,
                      {
                        backgroundColor: isSelected
                          ? themeColors.primary
                          : themeColors.surfaceSecondary,

                        borderColor: isSelected
                          ? themeColors.primary
                          : themeColors.cardBorder,
                      },
                    ]}
                    onPress={() =>
                      setReminderTime(time)
                    }
                  >
                    <Text
                      style={[
                        styles.timeChipText,
                        {
                          color: isSelected
                            ? "#FFFFFF"
                            : themeColors.textPrimary,
                        },
                      ]}
                    >
                      {time}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Category */}

      <Text
        style={[
          styles.label,
          {
            color: themeColors.textPrimary,
          },
        ]}
      >
        Category
      </Text>

      <View style={styles.optionContainer}>
        {categories.map((item) => {
          const selected = category === item;

          return (
            <AnimatedPressable
              key={item}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: selected
                    ? themeColors.primary
                    : themeColors.surface,

                  borderColor: selected
                    ? themeColors.primary
                    : themeColors.cardBorder,
                },
              ]}
              onPress={() => setCategory(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: selected
                      ? "#FFFFFF"
                      : themeColors.textPrimary,
                  },
                ]}
              >
                {item}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>

      {/* Priority */}

      <Text
        style={[
          styles.label,
          {
            color: themeColors.textPrimary,
          },
        ]}
      >
        Priority
      </Text>

      <View style={styles.priorityRow}>
        {priorities.map((item) => {
          const selected = priority === item;

          return (
            <AnimatedPressable
              key={item}
              style={[
                styles.priorityButton,
                {
                  backgroundColor: selected
                    ? themeColors.primary
                    : themeColors.surface,

                  borderColor: selected
                    ? themeColors.primary
                    : themeColors.cardBorder,
                },
              ]}
              onPress={() => setPriority(item)}
            >
              <Text
                style={[
                  styles.priorityText,
                  {
                    color: selected
                      ? "#FFFFFF"
                      : themeColors.textPrimary,
                  },
                ]}
              >
                {item}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>

      {/* Emoji */}

      <Text
        style={[
          styles.label,
          {
            color: themeColors.textPrimary,
          },
        ]}
      >
        Choose Icon
      </Text>

      <View style={styles.emojiRow}>
        {emojis.map((emoji) => (
          <AnimatedPressable
            key={emoji}
            style={[
              styles.emojiButton,
              {
                backgroundColor:
                  themeColors.surface,

                borderColor:
                  selectedEmoji === emoji
                    ? themeColors.primary
                    : themeColors.cardBorder,

                borderWidth:
                  selectedEmoji === emoji ? 2 : 1,
              },
            ]}
            onPress={() =>
              setSelectedEmoji(emoji)
            }
          >
            <Text style={styles.emoji}>
              {emoji}
            </Text>
          </AnimatedPressable>
        ))}
      </View>

      {/* Color */}

      <Text
        style={[
          styles.label,
          {
            color: themeColors.textPrimary,
          },
        ]}
      >
        Choose Color Theme
      </Text>

      <View style={styles.colorRow}>
        {habitColors.map((color) => (
          <AnimatedPressable
            key={color}
            onPress={() =>
              setSelectedColor(color)
            }
            style={[
              styles.colorButton,
              {
                backgroundColor: color,
              },

              selectedColor === color && [
                styles.selectedColor,
                {
                  borderColor:
                    themeColors.textPrimary,
                },
              ],
            ]}
          />
        ))}
      </View>

      {/* Preview */}

      <Text
        style={[
          styles.label,
          {
            color: themeColors.textPrimary,
          },
        ]}
      >
        Live Preview
      </Text>

      <View
        style={[
          styles.previewCard,
          {
            backgroundColor:
              themeColors.surface,

            borderColor:
              themeColors.cardBorder,

            borderLeftColor:
              selectedColor,
          },
        ]}
      >
        <View
          style={[
            styles.previewIcon,
            {
              backgroundColor:
                selectedColor,
            },
          ]}
        >
          <Text style={styles.previewEmoji}>
            {selectedEmoji}
          </Text>
        </View>

        <View style={styles.previewInfo}>
          <Text
            style={[
              styles.previewName,
              {
                color:
                  themeColors.textPrimary,
              },
            ]}
          >
            {habitName.trim() ||
              "Your Habit Name"}
          </Text>

          {description.trim() ? (
            <Text
              style={[
                styles.previewSub,
                {
                  color:
                    themeColors.textSecondary,
                },
              ]}
            >
              {description.trim()}
            </Text>
          ) : null}

          <Text
            style={[
              styles.previewCategory,
              {
                color:
                  themeColors.textSecondary,
              },
            ]}
          >
            {category} • {priority} Priority{" "}
            {reminderEnabled
              ? `• ⏰ ${reminderTime}`
              : ""}
          </Text>
        </View>
      </View>

      {/* Save Button */}

      <AnimatedPressable
        style={[
          styles.saveButton,
          {
            backgroundColor:
              themeColors.primary,
          },

          isSaving &&
            styles.disabledButton,
        ]}
        onPress={handleAddHabit}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>
          {isSaving
            ? "Saving Habit..."
            : "+ Save Habit"}
        </Text>
      </AnimatedPressable>

      {/* Cancel */}

      <AnimatedPressable
        style={styles.cancelButton}
        onPress={() => router.replace("/")}
      >
        <Text
          style={[
            styles.cancelButtonText,
            {
              color:
                themeColors.textSecondary,
            },
          ]}
        >
          Cancel
        </Text>
      </AnimatedPressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 14,
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },

  textArea: {
    height: 80,
    textAlignVertical: "top",
  },

  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },

  error: {
    fontSize: 13,
    fontWeight: "600",
  },

  reminderCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },

  reminderToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconTextGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  reminderLabel: {
    fontSize: 15,
    fontWeight: "600",
  },

  subLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },

  timeOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  timeChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },

  timeChipText: {
    fontSize: 12,
    fontWeight: "600",
  },

  optionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  categoryButton: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },

  optionText: {
    fontSize: 13,
    fontWeight: "600",
  },

  priorityRow: {
    flexDirection: "row",
    gap: 10,
  },

  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },

  priorityText: {
    fontWeight: "600",
  },

  emojiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  emojiButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  emoji: {
    fontSize: 24,
  },

  colorRow: {
    flexDirection: "row",
    gap: 14,
  },

  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  selectedColor: {
    borderWidth: 3,
  },

  previewCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderLeftWidth: 5,
    marginBottom: 20,
  },

  previewIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  previewEmoji: {
    fontSize: 22,
  },

  previewInfo: {
    marginLeft: 12,
    flex: 1,
  },

  previewName: {
    fontSize: 16,
    fontWeight: "700",
  },

  previewSub: {
    fontSize: 12,
    marginTop: 2,
  },

  previewCategory: {
    fontSize: 12,
    marginTop: 4,
  },

  saveButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelButton: {
    padding: 15,
    alignItems: "center",
    marginTop: 4,
  },

  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});