import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/authcontext";

import {
  getHabitsFromFirebase,
  deleteHabitFromFirebase,
} from "../services/habitservices";

type Habit = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  priority?: string;
  icon?: string;
  color?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
  completed?: boolean;
  streak?: number;
  bestStreak?: number;
  completedDates?: string[];
};

export default function HabitDetailsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const params = useLocalSearchParams();

  const habitId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD HABIT
  // =========================

  const loadHabit = async () => {
    if (!user || !habitId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const habits =
        (await getHabitsFromFirebase(
          user.uid
        )) as Habit[];

      const foundHabit = habits.find(
        (item) => item.id === habitId
      );

      if (!foundHabit) {
        Alert.alert(
          "Habit Not Found",
          "This habit could not be found.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );

        return;
      }

      setHabit(foundHabit);
    } catch (error) {
      console.log(
        "Error loading habit:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to load habit."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabit();
  }, [user?.uid, habitId]);

  // =========================
  // DELETE
  // =========================

  const handleDelete = () => {
    if (!habit) return;

    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${habit.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",

          onPress: async () => {
            try {
              await deleteHabitFromFirebase(
                habit.id
              );

              Alert.alert(
                "Success",
                "Habit deleted successfully.",
                [
                  {
                    text: "OK",
                    onPress: () =>
                      router.back(),
                  },
                ]
              );
            } catch (error) {
              console.log(
                "Delete error:",
                error
              );

              Alert.alert(
                "Error",
                "Unable to delete habit."
              );
            }
          },
        },
      ]
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <View
        style={[
          styles.center,
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

  if (!habit) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={50}
          color={colors.textMuted}
        />

        <Text
          style={[
            styles.notFoundText,
            {
              color:
                colors.textPrimary,
            },
          ]}
        >
          Habit not found
        </Text>

        <Pressable
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
        >
          <Text style={styles.buttonText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  // =========================
  // MAIN UI
  // =========================

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
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.headerButton,
            {
              backgroundColor:
                colors.surfaceSecondary,
            },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.textPrimary}
          />
        </Pressable>

        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.textPrimary,
            },
          ]}
        >
          Habit Details
        </Text>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/edit-habit",
              params: {
                id: habit.id,
              },
            })
          }
          style={[
            styles.headerButton,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
        >
          <Ionicons
            name="create-outline"
            size={21}
            color="#FFFFFF"
          />
        </Pressable>
      </View>

      {/* HABIT ICON */}

      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor:
              habit.color ||
              colors.primary,
          },
        ]}
      >
        <Text style={styles.icon}>
          {habit.icon || "✓"}
        </Text>
      </View>

      {/* NAME */}

      <Text
        style={[
          styles.name,
          {
            color: colors.textPrimary,
          },
        ]}
      >
        {habit.name}
      </Text>

      {/* CATEGORY */}

      <Text
        style={[
          styles.category,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        {habit.category || "Personal"}
      </Text>

      {/* DESCRIPTION */}

      {habit.description ? (
        <View
          style={[
            styles.card,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.cardBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              {
                color:
                  colors.textPrimary,
              },
            ]}
          >
            Description
          </Text>

          <Text
            style={[
              styles.description,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {habit.description}
          </Text>
        </View>
      ) : null}

      {/* STATS */}

      <View style={styles.statsRow}>
        <View
          style={[
            styles.statCard,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.cardBorder,
            },
          ]}
        >
          <Ionicons
            name="flame"
            size={25}
            color={colors.warning}
          />

          <Text
            style={[
              styles.statNumber,
              {
                color:
                  colors.textPrimary,
              },
            ]}
          >
            {habit.streak || 0}
          </Text>

          <Text
            style={[
              styles.statLabel,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            Current Streak
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.cardBorder,
            },
          ]}
        >
          <Ionicons
            name="trophy"
            size={25}
            color={colors.primary}
          />

          <Text
            style={[
              styles.statNumber,
              {
                color:
                  colors.textPrimary,
              },
            ]}
          >
            {habit.bestStreak || 0}
          </Text>

          <Text
            style={[
              styles.statLabel,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            Best Streak
          </Text>
        </View>
      </View>

      {/* PRIORITY */}

      <View
        style={[
          styles.card,
          {
            backgroundColor:
              colors.surface,
            borderColor:
              colors.cardBorder,
          },
        ]}
      >
        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Ionicons
              name="flag-outline"
              size={21}
              color={colors.primary}
            />

            <Text
              style={[
                styles.infoTitle,
                {
                  color:
                    colors.textPrimary,
                },
              ]}
            >
              Priority
            </Text>
          </View>

          <Text
            style={[
              styles.infoValue,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {habit.priority || "Medium"}
          </Text>
        </View>
      </View>

      {/* REMINDER */}

      <View
        style={[
          styles.card,
          {
            backgroundColor:
              colors.surface,
            borderColor:
              colors.cardBorder,
          },
        ]}
      >
        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Ionicons
              name="notifications-outline"
              size={21}
              color={colors.primary}
            />

            <Text
              style={[
                styles.infoTitle,
                {
                  color:
                    colors.textPrimary,
                },
              ]}
            >
              Reminder
            </Text>
          </View>

          <Text
            style={[
              styles.infoValue,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {habit.reminderEnabled
              ? habit.reminderTime ||
                "Enabled"
              : "Off"}
          </Text>
        </View>
      </View>

      {/* COMPLETED DAYS */}

      <View
        style={[
          styles.card,
          {
            backgroundColor:
              colors.surface,
            borderColor:
              colors.cardBorder,
          },
        ]}
      >
        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Ionicons
              name="calendar-outline"
              size={21}
              color={colors.primary}
            />

            <Text
              style={[
                styles.infoTitle,
                {
                  color:
                    colors.textPrimary,
                },
              ]}
            >
              Completed Days
            </Text>
          </View>

          <Text
            style={[
              styles.infoValue,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {habit.completedDates?.length ||
              0}
          </Text>
        </View>
      </View>

      {/* EDIT BUTTON */}

      <Pressable
        onPress={() =>
          router.push({
            pathname: "/edit-habit",
            params: {
              id: habit.id,
            },
          })
        }
        style={[
          styles.editButton,
          {
            backgroundColor:
              colors.primary,
          },
        ]}
      >
        <Ionicons
          name="create-outline"
          size={21}
          color="#FFFFFF"
        />

        <Text style={styles.buttonText}>
          Edit Habit
        </Text>
      </Pressable>

      {/* DELETE BUTTON */}

      <Pressable
        onPress={handleDelete}
        style={styles.deleteButton}
      >
        <Ionicons
          name="trash-outline"
          size={21}
          color="#D32F2F"
        />

        <Text style={styles.deleteText}>
          Delete Habit
        </Text>
      </Pressable>
    </ScrollView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },

  notFoundText: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
  },

  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 25,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  icon: {
    fontSize: 42,
  },

  name: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },

  category: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
    marginBottom: 25,
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 7,
  },

  statLabel: {
    fontSize: 11,
    marginTop: 3,
    textAlign: "center",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },

  editButton: {
    height: 52,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },

  deleteButton: {
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#D32F2F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },

  backButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  deleteText: {
    color: "#D32F2F",
    fontSize: 15,
    fontWeight: "700",
  },
});