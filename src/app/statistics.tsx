import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/authcontext";
import { getHabitsFromFirebase } from "../services/habitservices";
import BottomNavBar from "../components/BottomNavBar";

type Habit = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  priority?: string;
  icon?: string;
  color?: string;
  completed?: boolean;
  streak?: number;
  bestStreak?: number;
  completedDates?: string[];
  createdAt?: string;
  userId?: string;
};

const getToday = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const getLast7Days = () => {
  const days: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    days.push(
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    );
  }

  return days;
};

export default function Statistics() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabits();
  }, [user]);

  const loadHabits = async () => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getHabitsFromFirebase(user.uid);

      setHabits(data as Habit[]);
    } catch (error) {
      console.log("Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const today = getToday();
  const last7Days = getLast7Days();

  const totalHabits = habits.length;

  const completedToday = habits.filter((habit) =>
    habit.completedDates?.includes(today)
  ).length;

  const completionRate =
    totalHabits > 0
      ? Math.round((completedToday / totalHabits) * 100)
      : 0;

  const totalCompletions = habits.reduce(
    (total, habit) => total + (habit.completedDates?.length || 0),
    0
  );

  const currentStreak = habits.reduce(
    (max, habit) => Math.max(max, habit.streak || 0),
    0
  );

  const bestStreak = habits.reduce(
    (max, habit) => Math.max(max, habit.bestStreak || 0),
    0
  );

  const weeklyProgress = useMemo(() => {
    return last7Days.map((date) => {
      const completed = habits.filter((habit) =>
        habit.completedDates?.includes(date)
      ).length;

      return {
        date,
        completed,
      };
    });
  }, [habits]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};

    habits.forEach((habit) => {
      const category = habit.category || "Other";

      if (!stats[category]) {
        stats[category] = 0;
      }

      stats[category]++;
    });

    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [habits]);

  const getDayName = (dateString: string) => {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-US", {
      weekday: "short",
    });
  };

  const getBarHeight = (completed: number) => {
    if (totalHabits === 0) {
      return 8;
    }

    const percentage = completed / totalHabits;

    return Math.max(8, percentage * 100);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />

        <Text
          style={[
            styles.loadingText,
            { color: colors.textSecondary },
          ]}
        >
          Loading statistics...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.textPrimary}
            />
          </Pressable>

          <View>
            <Text
              style={[
                styles.title,
                { color: colors.textPrimary },
              ]}
            >
              Statistics
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: colors.textSecondary },
              ]}
            >
              Track your habit progress
            </Text>
          </View>
        </View>

        {/* Main Stats */}
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name="list-outline"
              size={25}
              color={colors.primary}
            />

            <Text
              style={[
                styles.statValue,
                { color: colors.textPrimary },
              ]}
            >
              {totalHabits}
            </Text>

            <Text
              style={[
                styles.statLabel,
                { color: colors.textSecondary },
              ]}
            >
              Total Habits
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={25}
              color={colors.primary}
            />

            <Text
              style={[
                styles.statValue,
                { color: colors.textPrimary },
              ]}
            >
              {completedToday}
            </Text>

            <Text
              style={[
                styles.statLabel,
                { color: colors.textSecondary },
              ]}
            >
              Completed Today
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name="flame-outline"
              size={25}
              color={colors.primary}
            />

            <Text
              style={[
                styles.statValue,
                { color: colors.textPrimary },
              ]}
            >
              {currentStreak}
            </Text>

            <Text
              style={[
                styles.statLabel,
                { color: colors.textSecondary },
              ]}
            >
              Current Streak
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name="trophy-outline"
              size={25}
              color={colors.primary}
            />

            <Text
              style={[
                styles.statValue,
                { color: colors.textPrimary },
              ]}
            >
              {bestStreak}
            </Text>

            <Text
              style={[
                styles.statLabel,
                { color: colors.textSecondary },
              ]}
            >
              Best Streak
            </Text>
          </View>
        </View>

        {/* Today's Completion */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textPrimary },
            ]}
          >
            Today's Completion
          </Text>

          <View style={styles.progressRow}>
            <View
              style={[
                styles.progressBackground,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${completionRate}%`,
                  },
                ]}
              />
            </View>

            <Text
              style={[
                styles.progressText,
                { color: colors.textPrimary },
              ]}
            >
              {completionRate}%
            </Text>
          </View>

          <Text
            style={[
              styles.smallText,
              { color: colors.textSecondary },
            ]}
          >
            {completedToday} of {totalHabits} habits completed today
          </Text>
        </View>

        {/* Weekly Progress */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textPrimary },
            ]}
          >
            Last 7 Days
          </Text>

          <View style={styles.chart}>
            {weeklyProgress.map((item) => (
              <View
                key={item.date}
                style={styles.chartColumn}
              >
                <Text
                  style={[
                    styles.chartValue,
                    { color: colors.textSecondary },
                  ]}
                >
                  {item.completed}
                </Text>

                <View
                  style={[
                    styles.barContainer,
                    {
                      backgroundColor:
                        colors.surfaceSecondary,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.bar,
                      {
                        backgroundColor: colors.primary,
                        height: getBarHeight(
                          item.completed
                        ),
                      },
                    ]}
                  />
                </View>

                <Text
                  style={[
                    styles.dayText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {getDayName(item.date)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Total Completions */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface },
          ]}
        >
          <View style={styles.totalRow}>
            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.textPrimary },
                ]}
              >
                Total Completions
              </Text>

              <Text
                style={[
                  styles.smallText,
                  { color: colors.textSecondary },
                ]}
              >
                All completed habit days
              </Text>
            </View>

            <Text
              style={[
                styles.bigNumber,
                { color: colors.primary },
              ]}
            >
              {totalCompletions}
            </Text>
          </View>
        </View>

        {/* Categories */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textPrimary },
            ]}
          >
            Habits by Category
          </Text>

          {categoryStats.length === 0 ? (
            <Text
              style={[
                styles.emptyText,
                { color: colors.textSecondary },
              ]}
            >
              No habits available.
            </Text>
          ) : (
            categoryStats.map(([category, count]) => (
              <View
                key={category}
                style={styles.categoryRow}
              >
                <View style={styles.categoryLeft}>
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor:
                          colors.primaryLight,
                      },
                    ]}
                  >
                    <Ionicons
                      name="ellipse"
                      size={10}
                      color={colors.primary}
                    />
                  </View>

                  <Text
                    style={[
                      styles.categoryName,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {category}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.categoryCount,
                    { color: colors.textSecondary },
                  ]}
                >
                  {count}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Empty state */}
        {habits.length === 0 && (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name="stats-chart-outline"
              size={45}
              color={colors.textMuted}
            />

            <Text
              style={[
                styles.emptyTitle,
                { color: colors.textPrimary },
              ]}
            >
              No Statistics Yet
            </Text>

            <Text
              style={[
                styles.emptyText,
                { color: colors.textSecondary },
              ]}
            >
              Create some habits and start completing them
              to see your statistics here.
            </Text>

            <Pressable
              onPress={() => router.push("/add-habit")}
              style={[
                styles.createButton,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.createButtonText}>
                Create Habit
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  content: {
    padding: 20,
    paddingBottom: 110,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 14,
    marginTop: 3,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  statCard: {
    width: "48%",
    minHeight: 125,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    justifyContent: "center",
  },

  statValue: {
    fontSize: 27,
    fontWeight: "800",
    marginTop: 8,
  },

  statLabel: {
    fontSize: 13,
    marginTop: 3,
  },

  section: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },

  progressBackground: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 5,
  },

  progressText: {
    width: 50,
    textAlign: "right",
    fontSize: 16,
    fontWeight: "700",
  },

  smallText: {
    fontSize: 13,
    marginTop: 8,
  },

  chart: {
    height: 180,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 18,
  },

  chartColumn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  chartValue: {
    fontSize: 11,
    marginBottom: 5,
  },

  barContainer: {
    width: 24,
    height: 100,
    borderRadius: 12,
    justifyContent: "flex-end",
    overflow: "hidden",
  },

  bar: {
    width: "100%",
    borderRadius: 12,
    minHeight: 8,
  },

  dayText: {
    fontSize: 11,
    marginTop: 7,
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  bigNumber: {
    fontSize: 32,
    fontWeight: "800",
  },

  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },

  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  categoryIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  categoryName: {
    fontSize: 15,
    fontWeight: "500",
  },

  categoryCount: {
    fontSize: 14,
    fontWeight: "600",
  },

  emptyCard: {
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginTop: 12,
  },

  emptyText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
  },

  createButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },

  createButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});