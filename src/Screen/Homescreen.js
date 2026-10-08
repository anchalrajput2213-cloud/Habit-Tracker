import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Habit Tracker</Text>

      <Text style={styles.subtitle}>
        Build good habits, one day at a time.
      </Text>

      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>No habits added yet.</Text>

        <Text style={styles.smallText}>
          Add your first habit to get started.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("AddHabit")}
      >
        <Text style={styles.buttonText}>+ Add Habit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 20,
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },

  emptyBox: {
    backgroundColor: "#ffffff",
    padding: 25,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
  },

  smallText: {
    fontSize: 14,
    color: "#777",
    marginTop: 8,
  },

  button: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});