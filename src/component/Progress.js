import { View, Text, StyleSheet } from "react-native";

export default function Progress({ completed, total }) {
  const progress = total === 0 ? 0 : completed / total;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Progress</Text>

      <Text style={styles.count}>
        {completed} / {total} completed
      </Text>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressBar,
            { width: `${progress * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginTop: 25,
    marginBottom: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  count: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    marginBottom: 12,
  },

  progressBackground: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#222",
    borderRadius: 10,
  },
});