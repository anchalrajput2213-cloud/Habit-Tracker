import React from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { AnimatedPressable } from "../components/AnimatedPressable";

export default function HabitCard({ habit, onToggle, onDelete }) {
  const { colors, isDark } = useTheme();

  const openDetails = () => {
    router.push({
      pathname: "/habitdetails",
      params: {
        id: habit.id.toString(),
      },
    });
  };

  const handleDeletePress = () => {
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${habit.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(habit.id),
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
          borderLeftColor: habit.color || colors.primary,
        },
      ]}
    >
      <AnimatedPressable
        style={styles.habitArea}
        onPress={() => onToggle(habit.id)}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: habit.completed ? (habit.color || colors.primary) : colors.textMuted,
              backgroundColor: habit.completed ? (habit.color || colors.primary) : "transparent",
            },
          ]}
        >
          {habit.completed && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.icon}>{habit.icon || "🎯"}</Text>
            <Text
              style={[
                styles.habitName,
                { color: colors.textPrimary },
                habit.completed && [styles.completedText, { color: colors.textMuted }],
              ]}
              numberOfLines={1}
            >
              {habit.name}
            </Text>
          </View>

          {habit.description ? (
            <Text
              style={[styles.description, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {habit.description}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            <Text style={[styles.category, { color: colors.textSecondary }]}>
              {habit.category || "Personal"} • {habit.priority || "Medium"}
            </Text>

            {habit.reminderEnabled && habit.reminderTime ? (
              <View style={[styles.reminderBadge, { backgroundColor: colors.iconBg }]}>
                <Ionicons name="alarm-outline" size={12} color={colors.primary} />
                <Text style={[styles.reminderText, { color: colors.primary }]}>
                  {habit.reminderTime}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.streakRow}>
            <Text style={[styles.streak, { color: colors.textPrimary }]}>
              🔥 {habit.streak || 0} day streak
            </Text>
          </View>
        </View>
      </AnimatedPressable>

      <View style={styles.actions}>
        <AnimatedPressable
          style={[styles.detailsButton, { backgroundColor: colors.surfaceSecondary }]}
          onPress={openDetails}
        >
          <Ionicons name="chevron-forward" size={16} color={colors.textPrimary} />
        </AnimatedPressable>

        <AnimatedPressable style={styles.deleteButton} onPress={handleDeletePress}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },

  habitArea: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    fontSize: 20,
    marginRight: 8,
  },

  habitName: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },

  completedText: {
    textDecorationLine: "line-through",
  },

  description: {
    fontSize: 13,
    marginTop: 3,
    marginBottom: 2,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
    flexWrap: "wrap",
  },

  category: {
    fontSize: 12,
    fontWeight: "500",
  },

  reminderBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },

  reminderText: {
    fontSize: 11,
    fontWeight: "600",
  },

  streakRow: {
    marginTop: 6,
  },

  streak: {
    fontSize: 12,
    fontWeight: "600",
  },

  actions: {
    alignItems: "center",
    marginLeft: 10,
    gap: 12,
  },

  detailsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    padding: 6,
  },
});