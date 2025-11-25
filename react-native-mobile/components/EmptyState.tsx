import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { theme } from "../styles/theme";

interface EmptyStateProps {
  message: string;
  icon?: string;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon = "📭",
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(3),
  },
  icon: {
    fontSize: 48,
    marginBottom: theme.spacing(2),
  },
  message: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
