import { Stack, Redirect, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";

import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { AuthProvider, useAuth } from "../context/authcontext";

function RootStack() {
  const { colors, isDark } = useTheme();
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Firebase auth state check hone tak loading
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // User login nahi hai
  // Login/Register ko access karne do
  if (!user && pathname !== "/login" && pathname !== "/register") {
    return <Redirect href="/login" />;
  }

  // User already login hai
  // Login/Register page par wapas jaane se roko
  if (user && (pathname === "/login" || pathname === "/register")) {
    return <Redirect href="/" />;
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />

      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },

          headerTintColor: colors.textPrimary,

          headerTitleStyle: {
            fontWeight: "700",
          },

          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {/* Authentication Screens */}

        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="register"
          options={{
            headerShown: false,
          }}
        />

        {/* Main App Screens */}

        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="statistics"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="add-habit"
          options={{
            title: "Create Habit",
            presentation: "card",
          }}
        />

        <Stack.Screen
          name="habitdetails"
          options={{
            title: "Habit Details",
          }}
        />

        <Stack.Screen
          name="edit-habit"
          options={{
            title: "Edit Habit",
          }}
        />

        <Stack.Screen
          name="explore"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </ThemeProvider>
  );
}