
// Get today's date in YYYY-MM-DD format
export const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

// Get yesterday's date
export const getYesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
};

// Check if the habit was completed today
export const isCompletedToday = (habit) => {
  const today = getToday();
  return (habit.completedDates || []).includes(today);
};

// Calculate the current consecutive streak
export const calculateCurrentStreak = (completedDates = []) => {
  if (!completedDates || completedDates.length === 0) {
    return 0;
  }

  // Remove duplicate dates
  const uniqueDates = [...new Set(completedDates)];

  // Sort newest date first
  const dates = uniqueDates.sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const today = getToday();
  const yesterday = getYesterday();

  // If the latest completion is older than yesterday, streak is broken
  if (dates[0] !== today && dates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;

  for (let i = 0; i < dates.length - 1; i++) {
    const currentDate = new Date(dates[i]);
    const previousDate = new Date(dates[i + 1]);

    const difference =
      (currentDate.getTime() - previousDate.getTime()) /
      (1000 * 60 * 60 * 24);

    if (Math.round(difference) === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

// Calculate the best streak ever
export const calculateBestStreak = (completedDates = []) => {
  if (!completedDates || completedDates.length === 0) {
    return 0;
  }

  // Remove duplicates and sort oldest first
  const dates = [...new Set(completedDates)].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  let bestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const previousDate = new Date(dates[i - 1]);
    const currentDate = new Date(dates[i]);

    const difference =
      (currentDate.getTime() - previousDate.getTime()) /
      (1000 * 60 * 60 * 24);

    if (Math.round(difference) === 1) {
      currentStreak++;
    } else {
      currentStreak = 1;
    }

    bestStreak = Math.max(bestStreak, currentStreak);
  }

  return bestStreak;
};

// Update the streak information of a habit
export const updateHabitStreak = (habit) => {
  const completedDates = habit.completedDates || [];
  const currentStreak = calculateCurrentStreak(completedDates);
  const bestStreak = calculateBestStreak(completedDates);

  return {
    ...habit,
    completed: isCompletedToday({
      ...habit,
      completedDates,
    }),
    streak: currentStreak,
    bestStreak: Math.max(habit.bestStreak || 0, bestStreak),
  };
};

// Get the last 7 days including today
export const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

    days.push({
      date: dateString,
      day: dayName,
    });
  }
  return days;
};

// Check whether any habit was completed on a specific date
export const isDateCompleted = (habits, date) => {
  return habits.some((habit) =>
    (habit.completedDates || []).includes(date)
  );
};

// Duplicate Habit Check
export const checkDuplicateHabit = (habits, habitName, excludeId = null) => {
  if (!habitName || !habitName.trim()) return false;
  const cleanName = habitName.trim().toLowerCase();
  return habits.some((habit) => {
    if (excludeId !== null && habit.id?.toString() === excludeId?.toString()) {
      return false;
    }
    return (habit.name || "").trim().toLowerCase() === cleanName;
  });
};

// Get weekly completion statistics (Last 7 Days)
export const getWeeklyProgress = (habits = []) => {
  const days = getLast7Days();
  return days.map((dayObj) => {
    let completedCount = 0;
    habits.forEach((habit) => {
      if ((habit.completedDates || []).includes(dayObj.date)) {
        completedCount++;
      }
    });
    const percentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
    return {
      ...dayObj,
      completedCount,
      totalHabits: habits.length,
      percentage,
    };
  });
};

// Get category-wise statistics
export const getCategoryStats = (habits = []) => {
  const categoryMap = {};

  habits.forEach((habit) => {
    const cat = habit.category || "Personal";
    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        category: cat,
        total: 0,
        completedToday: 0,
        totalCompletions: 0,
      };
    }

    categoryMap[cat].total += 1;
    if (isCompletedToday(habit)) {
      categoryMap[cat].completedToday += 1;
    }
    categoryMap[cat].totalCompletions += (habit.completedDates || []).length;
  });

  return Object.values(categoryMap).map((catStat) => {
    const rate = catStat.total > 0 ? Math.round((catStat.completedToday / catStat.total) * 100) : 0;
    return {
      ...catStat,
      completionRate: rate,
    };
  });
};

// Get overall statistics summary
export const getOverallStats = (habits = []) => {
  const total = habits.length;
  const completedToday = habits.filter(isCompletedToday).length;
  const pendingToday = total - completedToday;
  const completionRateToday = total > 0 ? Math.round((completedToday / total) * 100) : 0;

  const totalCompletionsAllTime = habits.reduce(
    (sum, habit) => sum + (habit.completedDates || []).length,
    0
  );

  const bestStreakOverall = habits.reduce(
    (max, habit) => Math.max(max, habit.bestStreak || 0),
    0
  );

  const totalActiveStreakSum = habits.reduce(
    (sum, habit) => sum + (habit.streak || 0),
    0
  );

  let topHabit = null;
  if (habits.length > 0) {
    topHabit = [...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0))[0];
  }

  return {
    total,
    completedToday,
    pendingToday,
    completionRateToday,
    totalCompletionsAllTime,
    bestStreakOverall,
    totalActiveStreakSum,
    topHabit,
  };
};
