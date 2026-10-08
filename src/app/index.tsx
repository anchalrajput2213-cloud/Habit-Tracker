import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  Pressable,
  Platform,
} from "react-native";

import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/authcontext";

import {
  getHabitsFromFirebase,
  updateHabitInFirebase,
  deleteHabitFromFirebase,
} from "../services/habitservices";

import BottomNavBar from "../components/BottomNavBar";

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
  createdAt?: any;
  userId?: string;
};

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getLast7Days = () => {
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const dateString = `${year}-${month}-${day}`;

    days.push({
      date: dateString,
      day: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
    });
  }

  return days;
};

export default function HomeScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD HABITS FROM FIREBASE
  // =========================

  const loadHabits = async () => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const firebaseHabits = await getHabitsFromFirebase(user.uid);

      const formattedHabits = firebaseHabits.map((habit: any) => {
        const completedDates = habit.completedDates || [];

        return {
          ...habit,
          completedDates,
          completed: completedDates.includes(getToday()),
        };
      });

      setHabits(formattedHabits);
    } catch (error) {
      console.log("Error loading habits:", error);

      Alert.alert(
        "Error",
        "Unable to load habits. Please check your Firebase Firestore rules."
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [user?.uid])
  );

  // =========================
  // TOGGLE HABIT
  // =========================

  const handleToggle = async (habit: Habit) => {
    if (!user) {
      Alert.alert("Login Required", "Please login first.");
      return;
    }

    try {
      const today = getToday();

      const completedDates = habit.completedDates || [];

      const alreadyCompleted = completedDates.includes(today);

      let updatedDates: string[];

      if (alreadyCompleted) {
        updatedDates = completedDates.filter(
          (date) => date !== today
        );
      } else {
        updatedDates = [...completedDates, today];
      }

      const updatedHabit = {
        ...habit,
        completedDates: updatedDates,
        completed: !alreadyCompleted,
      };

      // Remove fields that should not be sent back
      const {
        id,
        userId,
        ...habitData
      } = updatedHabit;

      await updateHabitInFirebase(id, {
        ...habitData,
        completedDates: updatedDates,
        completed: !alreadyCompleted,
      });

      setHabits((currentHabits) =>
        currentHabits.map((item) =>
          item.id === habit.id
            ? updatedHabit
            : item
        )
      );

      console.log("Habit updated successfully");
    } catch (error) {
      console.log("Error updating habit:", error);

      Alert.alert(
        "Error",
        "Unable to update habit."
      );
    }
  };

  // =========================
  // DELETE HABIT
  // =========================

  const handleDelete = (habit: Habit) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${habit.name}"?`
      );

      if (!confirmed) {
        return;
      }

      deleteHabitFromFirebase(habit.id)
        .then(() => {
          setHabits((currentHabits) =>
            currentHabits.filter(
              (item) => item.id !== habit.id
            )
          );

          console.log("Habit deleted successfully");
        })
        .catch((error) => {
          console.log("Delete error:", error);
          window.alert("Unable to delete habit.");
        });

      return;
    }

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
              await deleteHabitFromFirebase(habit.id);

              setHabits((currentHabits) =>
                currentHabits.filter(
                  (item) => item.id !== habit.id
                )
              );

              console.log("Habit deleted successfully");
            } catch (error) {
              console.log("Delete error:", error);

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
  // FILTER
  // =========================

  const filteredHabits = habits.filter((habit) => {
    const name = habit.name || "";

    const matchesSearch = name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    let matchesFilter = true;

    if (filter === "Completed") {
      matchesFilter = habit.completed === true;
    }

    if (filter === "Pending") {
      matchesFilter = habit.completed !== true;
    }

    if (filter === "High Priority") {
      matchesFilter = habit.priority === "High";
    }

    if (filter === "Study") {
      matchesFilter = habit.category === "Study";
    }

    if (filter === "Fitness") {
      matchesFilter = habit.category === "Fitness";
    }

    if (filter === "Coding") {
      matchesFilter = habit.category === "Coding";
    }

    return matchesSearch && matchesFilter;
  });

  // =========================
  // STATISTICS
  // =========================

  const totalHabits = habits.length;

  const completedCount = habits.filter(
    (habit) => habit.completed
  ).length;

  const pendingCount =
    totalHabits - completedCount;

  const percentage =
    totalHabits === 0
      ? 0
      : Math.round(
          (completedCount / totalHabits) * 100
        );

  const currentStreakSum = habits.reduce(
    (total, habit) =>
      total + (habit.streak || 0),
    0
  );

  const bestStreak = habits.reduce(
    (best, habit) =>
      Math.max(
        best,
        habit.bestStreak || 0
      ),
    0
  );

  const getMessage = () => {
    if (totalHabits === 0) {
      return "Create your first habit to get started!";
    }

    if (percentage === 0) {
      return "Let's get started today!";
    }

    if (percentage < 50) {
      return "Great start! Keep going!";
    }

    if (percentage < 100) {
      return "Almost there! Finish strong!";
    }

    return "Outstanding! All habits completed today!";
  };

  const last7Days = getLast7Days();

  // =========================
  // HABIT CARD
  // =========================

  const renderHabit = ({
    item,
  }: {
    item: Habit;
  }) => {
    return (
      <View
        style={[
          styles.habitCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.habitTop}>
          <View
            style={[
              styles.habitIcon,
              {
                backgroundColor:
                  item.color || colors.primary,
              },
            ]}
          >
            <Text style={styles.habitEmoji}>
              {item.icon || "✓"}
            </Text>
          </View>

          <View style={styles.habitInfo}>
            <Text
              style={[
                styles.habitName,
                {
                  color: colors.textPrimary,
                },
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <Text
              style={[
                styles.habitCategory,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {item.category || "Personal"}
            </Text>
          </View>

          {item.priority && (
            <View
              style={[
                styles.priorityBadge,
                {
                  backgroundColor:
                    item.priority === "High"
                      ? "#FFE5E5"
                      : colors.surfaceSecondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  {
                    color:
                      item.priority === "High"
                        ? "#D32F2F"
                        : colors.textSecondary,
                  },
                ]}
              >
                {item.priority}
              </Text>
            </View>
          )}
        </View>

        {item.description ? (
          <Text
            style={[
              styles.description,
              {
                color: colors.textSecondary,
              },
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        ) : null}

        <View style={styles.habitBottom}>
          <View style={styles.streakContainer}>
            <Ionicons
              name="flame-outline"
              size={17}
              color={colors.warning}
            />

            <Text
              style={[
                styles.streakText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {item.streak || 0} day streak
            </Text>
          </View>

          <View style={styles.habitActions}>
            {/* COMPLETE BUTTON */}

            <Pressable
              onPress={() => handleToggle(item)}
              style={[
                styles.actionButton,
                {
                  backgroundColor: item.completed
                    ? colors.accent
                    : colors.surfaceSecondary,
                },
              ]}
            >
              <Ionicons
                name={
                  item.completed
                    ? "checkmark"
                    : "checkmark-outline"
                }
                size={20}
                color={
                  item.completed
                    ? "#FFFFFF"
                    : colors.textPrimary
                }
              />
            </Pressable>

            {/* EDIT BUTTON */}

            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/edit-habit",
                  params: {
                    id: item.id,
                  },
                })
              }
              style={[
                styles.actionButton,
                {
                  backgroundColor:
                    colors.surfaceSecondary,
                },
              ]}
            >
              <Ionicons
                name="create-outline"
                size={19}
                color={colors.textPrimary}
              />
            </Pressable>

            {/* DELETE BUTTON */}

            <Pressable
              onPress={() => handleDelete(item)}
              style={[
                styles.actionButton,
                {
                  backgroundColor: "#FFE8E8",
                },
              ]}
            >
              <Ionicons
                name="trash-outline"
                size={19}
                color="#D32F2F"
              />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  // =========================
  // LOADING
  // =========================

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
              color: colors.textSecondary,
            },
          ]}
        >
          Loading your habits...
        </Text>
      </View>
    );
  }

  // =========================
  // MAIN SCREEN
  // =========================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <FlatList
        data={filteredHabits}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* HEADER */}

            <View style={styles.header}>
              <View>
                <Text
                  style={[
                    styles.title,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  Habit Tracker
                </Text>

                <Text
                  style={[
                    styles.subtitle,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  Build better habits, one day at a time.
                </Text>
              </View>

              <View style={styles.headerButtons}>
                {/* THEME BUTTON */}

                <Pressable
                  onPress={toggleTheme}
                  style={[
                    styles.headerIconBtn,
                    {
                      backgroundColor:
                        colors.surfaceSecondary,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      isDark
                        ? "sunny-outline"
                        : "moon-outline"
                    }
                    size={20}
                    color={colors.textPrimary}
                  />
                </Pressable>

                {/* SETTINGS BUTTON */}

                <Pressable
                  onPress={() =>
                    router.push("/settings")
                  }
                  style={[
                    styles.headerIconBtn,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                >
                  <Ionicons
                    name="settings-outline"
                    size={20}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>
            </View>

            {/* PROGRESS CARD */}

            <View
              style={[
                styles.progressCard,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              <View style={styles.progressHeader}>
                <View>
                  <Text style={styles.progressTitle}>
                    Today's Progress
                  </Text>

                  <Text style={styles.progressMessage}>
                    {getMessage()}
                  </Text>
                </View>

                <Text style={styles.percentage}>
                  {percentage}%
                </Text>
              </View>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${percentage}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.progressFooter}>
                <Text style={styles.progressText}>
                  {completedCount} of {totalHabits} habits
                  completed
                </Text>

                <Pressable
                  onPress={() =>
                    router.push("/add-habit")
                  }
                  style={styles.addQuickBtn}
                >
                  <Ionicons
                    name="add"
                    size={16}
                    color="#FFFFFF"
                  />

                  <Text style={styles.addQuickText}>
                    New Habit
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* 7 DAY ACTIVITY */}

            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text
                    style={[
                      styles.cardTitle,
                      {
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    7-Day Activity
                  </Text>

                  <Text
                    style={[
                      styles.cardSub,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    Your recent consistency
                  </Text>
                </View>

                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>

              <View style={styles.daysRow}>
                {last7Days.map((item) => {
                  const completed = habits.some(
                    (habit) =>
                      habit.completedDates?.includes(
                        item.date
                      )
                  );

                  const isToday =
                    item.date === getToday();

                  return (
                    <View
                      key={item.date}
                      style={styles.dayItem}
                    >
                      <Text
                        style={[
                          styles.dayName,
                          {
                            color:
                              colors.textSecondary,
                          },
                        ]}
                      >
                        {item.day}
                      </Text>

                      <View
                        style={[
                          styles.dayCircle,
                          {
                            backgroundColor: completed
                              ? colors.accent
                              : colors.surfaceSecondary,

                            borderColor: isToday
                              ? colors.primary
                              : "transparent",

                            borderWidth: isToday
                              ? 2
                              : 0,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayNumber,
                            {
                              color: completed
                                ? "#FFFFFF"
                                : colors.textPrimary,
                            },
                          ]}
                        >
                          {new Date(
                            item.date
                          ).getDate()}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

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
                  size={20}
                  color={colors.warning}
                />

                <View style={{ marginLeft: 8 }}>
                  <Text
                    style={[
                      styles.statNumber,
                      {
                        color:
                          colors.textPrimary,
                      },
                    ]}
                  >
                    {currentStreakSum}
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
                    Active Streaks
                  </Text>
                </View>
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
                  size={20}
                  color={colors.primary}
                />

                <View style={{ marginLeft: 8 }}>
                  <Text
                    style={[
                      styles.statNumber,
                      {
                        color:
                          colors.textPrimary,
                      },
                    ]}
                  >
                    {bestStreak}
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
            </View>

            {/* SEARCH */}

            <View style={styles.searchContainer}>
              <Ionicons
                name="search-outline"
                size={18}
                color={colors.textMuted}
                style={styles.searchIcon}
              />

              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor:
                      colors.surface,
                    borderColor:
                      colors.cardBorder,
                    color:
                      colors.textPrimary,
                  },
                ]}
                placeholder="Search habits..."
                placeholderTextColor={
                  colors.textMuted
                }
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {/* FILTERS */}

            <View style={styles.filterRow}>
              {[
                "All",
                "Completed",
                "Pending",
                "High Priority",
                "Study",
                "Fitness",
                "Coding",
              ].map((item) => {
                const isActive =
                  filter === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() =>
                      setFilter(item)
                    }
                    style={[
                      styles.filterButton,
                      {
                        backgroundColor:
                          isActive
                            ? colors.primary
                            : colors.surface,

                        borderColor:
                          isActive
                            ? colors.primary
                            : colors.cardBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        {
                          color: isActive
                            ? "#FFFFFF"
                            : colors.textPrimary,
                        },
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* SECTION HEADER */}

            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                My Habits
              </Text>

              <Text
                style={[
                  styles.habitCount,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                {filteredHabits.length}
              </Text>
            </View>

            {/* EMPTY STATE */}

            {filteredHabits.length === 0 && (
              <View
                style={[
                  styles.emptyBox,
                  {
                    backgroundColor:
                      colors.surface,
                    borderColor:
                      colors.cardBorder,
                  },
                ]}
              >
                <Ionicons
                  name="checkbox-outline"
                  size={42}
                  color={colors.textMuted}
                />

                <Text
                  style={[
                    styles.emptyTitle,
                    {
                      color:
                        colors.textPrimary,
                    },
                  ]}
                >
                  {habits.length === 0
                    ? "No habits yet"
                    : "No habits found"}
                </Text>

                <Text
                  style={[
                    styles.emptyText,
                    {
                      color:
                        colors.textSecondary,
                    },
                  ]}
                >
                  {habits.length === 0
                    ? "Add your first habit to begin tracking your routines."
                    : "Try adjusting your search terms or filter selection."}
                </Text>

                {habits.length === 0 && (
                  <Pressable
                    onPress={() =>
                      router.push(
                        "/add-habit"
                      )
                    }
                    style={[
                      styles.emptyAddBtn,
                      {
                        backgroundColor:
                          colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.emptyAddBtnText
                      }
                    >
                      + Add First Habit
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </>
        }
        renderItem={renderHabit}
        ListFooterComponent={
          <Pressable
            onPress={() =>
              router.push("/add-habit")
            }
            style={[
              styles.addButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <Ionicons
              name="add-circle"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.addButtonText}>
              Add New Habit
            </Text>
          </Pressable>
        }
      />

      <BottomNavBar />
    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },

  listContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 120,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },

  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  progressCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  progressTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  progressMessage: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    marginTop: 4,
  },

  percentage: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },

  progressBackground: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 8,
    marginTop: 16,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },

  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  progressText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },

  addQuickBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },

  addQuickText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  cardSub: {
    fontSize: 12,
    marginTop: 2,
  },

  daysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  dayItem: {
    alignItems: "center",
  },

  dayName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },

  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  dayNumber: {
    fontSize: 13,
    fontWeight: "700",
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },

  statNumber: {
    fontSize: 18,
    fontWeight: "800",
  },

  statLabel: {
    fontSize: 11,
  },

  searchContainer: {
    position: "relative",
    marginBottom: 14,
  },

  searchIcon: {
    position: "absolute",
    left: 14,
    top: 14,
    zIndex: 1,
  },

  searchInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingLeft: 42,
    paddingRight: 14,
    fontSize: 14,
  },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },

  filterButton: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },

  filterText: {
    fontSize: 12,
    fontWeight: "600",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  habitCount: {
    fontSize: 16,
    fontWeight: "800",
  },

  emptyBox: {
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    marginVertical: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },

  emptyText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },

  emptyAddBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },

  emptyAddBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 20,
    gap: 8,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  // =========================
  // HABIT CARD
  // =========================

  habitCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },

  habitTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  habitIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  habitEmoji: {
    fontSize: 22,
  },

  habitInfo: {
    flex: 1,
    marginLeft: 12,
  },

  habitName: {
    fontSize: 16,
    fontWeight: "700",
  },

  habitCategory: {
    fontSize: 12,
    marginTop: 3,
  },

  priorityBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },

  priorityText: {
    fontSize: 10,
    fontWeight: "700",
  },

  description: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
  },

  habitBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },

  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  streakText: {
    fontSize: 12,
    fontWeight: "600",
  },

  habitActions: {
    flexDirection: "row",
    gap: 8,
  },

  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});