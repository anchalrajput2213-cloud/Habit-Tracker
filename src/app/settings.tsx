import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/authcontext";
import { logoutUser } from "../services/authservices";
import BottomNavBar from "../components/BottomNavBar";

export default function Settings() {
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const { user } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logoutUser();
              router.replace("/login");
            } catch (error: any) {
              Alert.alert(
                "Logout Error",
                error?.message || "Unable to logout"
              );
            }
          },
        },
      ]
    );
  };

  const changeTheme = async (mode: "light" | "dark" | "system") => {
    await setThemeMode(mode);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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

          <Text
            style={[
              styles.title,
              { color: colors.textPrimary },
            ]}
          >
            Settings
          </Text>
        </View>

        {/* Account */}
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
            Account
          </Text>

          <View style={styles.accountRow}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons
                name="person"
                size={25}
                color="#fff"
              />
            </View>

            <View style={styles.accountInfo}>
              <Text
                style={[
                  styles.accountLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Logged in as
              </Text>

              <Text
                style={[
                  styles.email,
                  { color: colors.textPrimary },
                ]}
                numberOfLines={1}
              >
                {user?.email || "User"}
              </Text>
            </View>
          </View>
        </View>

        {/* Appearance */}
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
            Appearance
          </Text>

          <Text
            style={[
              styles.description,
              { color: colors.textSecondary },
            ]}
          >
            Choose how the app should look.
          </Text>

          {/* System */}
          <Pressable
            onPress={() => changeTheme("system")}
            style={[
              styles.option,
              {
                borderColor:
                  themeMode === "system"
                    ? colors.primary
                    :colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={23}
              color={colors.textPrimary}
            />

            <Text
              style={[
                styles.optionText,
                { color: colors.textPrimary },
              ]}
            >
              System Default
            </Text>

            {themeMode === "system" && (
              <Ionicons
                name="checkmark-circle"
                size={23}
                color={colors.primary}
              />
            )}
          </Pressable>

          {/* Light */}
          <Pressable
            onPress={() => changeTheme("light")}
            style={[
              styles.option,
              {
                borderColor:
                  themeMode === "light"
                    ? colors.primary
                    : colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="sunny-outline"
              size={23}
              color={colors.textPrimary}
            />

            <Text
              style={[
                styles.optionText,
                { color: colors.textPrimary },
              ]}
            >
              Light Mode
            </Text>

            {themeMode === "light" && (
              <Ionicons
                name="checkmark-circle"
                size={23}
                color={colors.primary}
              />
            )}
          </Pressable>

          {/* Dark */}
          <Pressable
            onPress={() => changeTheme("dark")}
            style={[
              styles.option,
              {
                borderColor:
                  themeMode === "dark"
                    ? colors.primary
                    : colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="moon-outline"
              size={23}
              color={colors.textPrimary}
            />

            <Text
              style={[
                styles.optionText,
                { color: colors.textPrimary },
              ]}
            >
              Dark Mode
            </Text>

            {themeMode === "dark" && (
              <Ionicons
                name="checkmark-circle"
                size={23}
                color={colors.primary}
              />
            )}
          </Pressable>
        </View>

        {/* Firebase information */}
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
            Data & Sync
          </Text>

          <View style={styles.infoRow}>
            <Ionicons
              name="cloud-done-outline"
              size={24}
              color={colors.primary}
            />

            <View style={styles.infoTextContainer}>
              <Text
                style={[
                  styles.infoTitle,
                  { color: colors.textPrimary },
                ]}
              >
                Firebase Cloud Sync
              </Text>

              <Text
                style={[
                  styles.description,
                  { color: colors.textSecondary },
                ]}
              >
                Your habits are stored in Firebase Firestore.
              </Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={[
            styles.logoutButton,
            { borderColor: "#e53935" },
          ]}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color="#e53935"
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>
      </ScrollView>

      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  section: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
  },

  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },

  accountInfo: {
    flex: 1,
    marginLeft: 14,
  },

  accountLabel: {
    fontSize: 13,
    marginBottom: 3,
  },

  email: {
    fontSize: 15,
    fontWeight: "600",
  },

  option: {
    minHeight: 55,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 12,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
  },

  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },

  logoutButton: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },

  logoutText: {
    color: "#e53935",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});