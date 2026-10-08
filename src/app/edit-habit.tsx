import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/authcontext";

import {
  getHabitsFromFirebase,
  updateHabitInFirebase,
} from "../services/habitservices";

/* =========================
   TYPES
========================= */

type Habit = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  priority?: string;
  icon?: string;
  color?: string;
  reminderEnabled?: boolean;
  reminderTime?: string | null;
  completed?: boolean;
  streak?: number;
  bestStreak?: number;
  completedDates?: string[];
  userId?: string;
  createdAt?: string | number;
};

/* =========================
   OPTIONS
========================= */

const categories = [
  "Study",
  "Fitness",
  "Health",
  "Coding",
  "Reading",
  "Personal",
  "Other",
];

const priorities = [
  "Low",
  "Medium",
  "High",
];

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

/* =========================
   COMPONENT
========================= */

export default function EditHabitScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const rawId = params.id;

  const habitId = Array.isArray(rawId)
    ? rawId[0]
    : rawId;

  const { colors } = useTheme();
  const { user } = useAuth();

  /* =========================
     STATES
  ========================= */

  const [habitName, setHabitName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("Study");

  const [priority, setPriority] =
    useState("Medium");

  const [selectedEmoji, setSelectedEmoji] =
    useState("🎯");

  const [selectedColor, setSelectedColor] =
    useState(habitColors[0]);

  const [reminderEnabled, setReminderEnabled] =
    useState(true);

  const [reminderTime, setReminderTime] =
    useState("08:00 AM");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =========================
     LOAD HABIT
  ========================= */

  useEffect(() => {
    loadHabit();
  }, [user, habitId]);

  const loadHabit = async () => {
    if (!user || !habitId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      /*
        Important:
        Firebase service returns habit data.
        We tell TypeScript that the result
        is Habit[].
      */

      const habits =
        (await getHabitsFromFirebase(
          user.uid
        )) as Habit[];

      const habit = habits.find(
        (item) => item.id === habitId
      );

      if (!habit) {
        Alert.alert(
          "Habit Not Found",
          "This habit could not be found."
        );

        router.back();
        return;
      }

      setHabitName(
        habit.name || ""
      );

      setDescription(
        habit.description || ""
      );

      setCategory(
        habit.category || "Study"
      );

      setPriority(
        habit.priority || "Medium"
      );

      setSelectedEmoji(
        habit.icon || "🎯"
      );

      setSelectedColor(
        habit.color || habitColors[0]
      );

      setReminderEnabled(
        habit.reminderEnabled ?? true
      );

      setReminderTime(
        habit.reminderTime || "08:00 AM"
      );
    } catch (error) {
      console.log(
        "LOAD HABIT ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Could not load habit."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UPDATE HABIT
  ========================= */

  const handleUpdate = async () => {
    console.log(
      "SAVE BUTTON PRESSED"
    );

    if (!user) {
      Alert.alert(
        "Login Required",
        "Please login first."
      );
      return;
    }

    if (!habitId) {
      Alert.alert(
        "Error",
        "Habit ID is missing."
      );
      return;
    }

    if (!habitName.trim()) {
      setError(
        "Please enter a habit name."
      );
      return;
    }

    if (habitName.trim().length < 2) {
      setError(
        "Habit name must be at least 2 characters."
      );
      return;
    }

    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updates = {
        name: habitName.trim(),

        description:
          description.trim(),

        category,

        priority,

        icon: selectedEmoji,

        color: selectedColor,

        reminderEnabled,

        reminderTime:
          reminderEnabled
            ? reminderTime
            : null,
      };

      console.log(
        "UPDATING HABIT:",
        updates
      );

      await updateHabitInFirebase(
        habitId,
        updates
      );

      console.log(
        "HABIT UPDATED SUCCESSFULLY"
      );

      Alert.alert(
        "Success",
        "Habit updated successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.log(
        "UPDATE HABIT ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Could not update habit. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     LOADING SCREEN
  ========================= */

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text
          style={[
            styles.loadingText,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          Loading habit...
        </Text>
      </View>
    );
  }

  /* =========================
     MAIN SCREEN
  ========================= */

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
      keyboardShouldPersistTaps="handled"
    >
      {/* TITLE */}

      <Text
        style={[
          styles.title,
          {
            color:
              colors.textPrimary,
          },
        ]}
      >
        Edit Habit
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color:
              colors.textSecondary,
          },
        ]}
      >
        Update your habit information,
        schedule, and style.
      </Text>

      {/* HABIT NAME */}

      <Text
        style={[
          styles.label,
          {
            color:
              colors.textPrimary,
          },
        ]}
      >
        Habit Name *
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor:
              colors.surface,

            borderColor:
              error
                ? colors.danger
                : colors.cardBorder,

            color:
              colors.textPrimary,
          },
        ]}
        value={habitName}
        onChangeText={(text) => {
          setHabitName(text);
          setError("");
        }}
        placeholder="Enter habit name"
        placeholderTextColor={
          colors.textMuted
        }
      />

      {/* ERROR */}

      {error !== "" && (
        <View style={styles.errorRow}>
          <Ionicons
            name="alert-circle"
            size={17}
            color={colors.danger}
          />

          <Text
            style={[
              styles.errorText,
              {
                color:
                  colors.danger,
              },
            ]}
          >
            {error}
          </Text>
        </View>
      )}

      {/* DESCRIPTION */}

      <Text
        style={[
          styles.label,
          {
            color:
              colors.textPrimary,
          },
        ]}
      >
        Description
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.textArea,
          {
            backgroundColor:
              colors.surface,

            borderColor:
              colors.cardBorder,

            color:
              colors.textPrimary,
          },
        ]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        placeholderTextColor={
          colors.textMuted
        }
        multiline
      />

      {/* CATEGORY */}

      <Text
        style={[
          styles.label,
          {
            color:
              colors.textPrimary,
          },
        ]}
      >
        Category
      </Text>

      <View style={styles.wrap}>
        {categories.map((item) => {
          const selected =
            category === item;

          return (
            <Pressable
              key={item}
              onPress={() => {
                setCategory(item);
              }}
              style={[
                styles.categoryButton,
                {
                  backgroundColor:
                    selected
                      ? colors.primary
                      : colors.surface,

                  borderColor:
                    selected
                      ? colors.primary
                      : colors.cardBorder,
                },
              ]}
            >
              <Text
                style={{
                  color: selected
                    ? "#FFFFFF"
                    : colors.textPrimary,

                  fontWeight:
                    "600",
                }}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* PRIORITY */}

      <Text
        style={[
          styles.label,
          {
            color:
              colors.textPrimary,
          },
        ]}
      >
        Priority
      </Text>

      <View
        style={styles.priorityRow}
      >
        {priorities.map((item) => {
          const selected =
            priority === item;

          return (
            <Pressable
              key={item}
              onPress={() => {
                setPriority(item);
              }}
              style={[
                styles.priorityButton,
                {
                  backgroundColor:
                    selected
                      ? colors.primary
                      : colors.surface,

                  borderColor:
                    selected
                      ? colors.primary
                      : colors.cardBorder,
                },
              ]}
            >
              <Text
                style={{
                  color: selected
                    ? "#FFFFFF"
                    : colors.textPrimary,

                  fontWeight:
                    "600",
                }}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ICON */}

      <Text
        style={[
          styles.label,
          {
            color:
              colors.textPrimary,
          },
        ]}
      >
        Icon
      </Text>

      <View style={styles.wrap}>
        {emojis.map((emoji) => {
          const selected =
            selectedEmoji === emoji;

          return (
            <Pressable
              key={emoji}
              onPress={() => {
                setSelectedEmoji(
                  emoji
                );
              }}
              style={[
                styles.emojiButton,
                {
                  backgroundColor:
                    colors.surface,

                  borderColor:
                    selected
                      ? colors.primary
                      : colors.cardBorder,

                  borderWidth:
                    selected ? 2 : 1,
                },
              ]}
            >
              <Text
                style={styles.emoji}
              >
                {emoji}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* COLOR */}

      <Text
        style={[
          styles.label,
          {
            color:
              colors.textPrimary,
          },
        ]}
      >
        Color Accent
      </Text>

      <View style={styles.colorRow}>
        {habitColors.map((color) => {
          const selected =
            selectedColor === color;

          return (
            <Pressable
              key={color}
              onPress={() => {
                setSelectedColor(
                  color
                );
              }}
              style={[
                styles.colorButton,
                {
                  backgroundColor:
                    color,

                  borderColor:
                    selected
                      ? colors.textPrimary
                      : "transparent",

                  borderWidth:
                    selected ? 3 : 0,
                },
              ]}
            />
          );
        })}
      </View>

      {/* REMINDER */}

      <Text
        style={[
          styles.label,
          {
            color:
              colors.textPrimary,
          },
        ]}
      >
        Reminder Settings
      </Text>

      <View
        style={[
          styles.reminderCard,
          {
            backgroundColor:
              colors.surface,

            borderColor:
              colors.cardBorder,
          },
        ]}
      >
        <View
          style={styles.reminderRow}
        >
          <View
            style={
              styles.reminderTextContainer
            }
          >
            <Ionicons
              name="alarm-outline"
              size={22}
              color={
                colors.primary
              }
            />

            <Text
              style={{
                color:
                  colors.textPrimary,

                fontSize: 15,

                fontWeight:
                  "600",
              }}
            >
              Daily Reminder
            </Text>
          </View>

          <Switch
            value={
              reminderEnabled
            }
            onValueChange={
              setReminderEnabled
            }
            trackColor={{
              false:
                colors.cardBorder,

              true:
                colors.primary,
            }}
          />
        </View>

        {/* TIME */}

        {reminderEnabled && (
          <View
            style={{
              marginTop: 15,
            }}
          >
            <Text
              style={{
                color:
                  colors.textSecondary,

                fontSize: 13,

                fontWeight:
                  "600",

                marginBottom: 8,
              }}
            >
              Reminder Time
            </Text>

            <View
              style={styles.wrap}
            >
              {times.map((time) => {
                const selected =
                  reminderTime ===
                  time;

                return (
                  <Pressable
                    key={time}
                    onPress={() => {
                      setReminderTime(
                        time
                      );
                    }}
                    style={[
                      styles.timeButton,
                      {
                        backgroundColor:
                          selected
                            ? colors.primary
                            : colors.surfaceSecondary,

                        borderColor:
                          selected
                            ? colors.primary
                            : colors.cardBorder,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          selected
                            ? "#FFFFFF"
                            : colors.textPrimary,

                        fontSize: 12,

                        fontWeight:
                          "600",
                      }}
                    >
                      {time}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* SAVE BUTTON */}

      <Pressable
        onPress={handleUpdate}
        disabled={saving}
        style={({ pressed }) => [
          styles.saveButton,

          {
            backgroundColor:
              colors.primary,

            opacity: saving
              ? 0.5
              : pressed
              ? 0.7
              : 1,
          },
        ]}
      >
        <Text
          style={styles.saveButtonText}
        >
          {saving
            ? "Saving..."
            : "Save Changes"}
        </Text>
      </Pressable>

      {/* CANCEL BUTTON */}

      <Pressable
        onPress={() => {
          console.log(
            "CANCEL BUTTON PRESSED"
          );

          router.back();
        }}
        style={({ pressed }) => [
          styles.cancelButton,

          {
            opacity: pressed
              ? 0.6
              : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.cancelButtonText,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          Cancel
        </Text>
      </Pressable>
    </ScrollView>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 15,
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 15,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },

  textArea: {
    height: 90,
    textAlignVertical: "top",
  },

  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 7,
  },

  errorText: {
    fontSize: 13,
    fontWeight: "600",
  },

  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },

  priorityRow: {
    flexDirection: "row",
    gap: 10,
  },

  priorityButton: {
    flex: 1,
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },

  emojiButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  emoji: {
    fontSize: 24,
  },

  colorRow: {
    flexDirection: "row",
    gap: 14,
  },

  colorButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },

  reminderCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },

  reminderRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  reminderTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },

  saveButton: {
    marginTop: 25,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  cancelButton: {
    padding: 16,
    alignItems: "center",
    marginTop: 5,
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});