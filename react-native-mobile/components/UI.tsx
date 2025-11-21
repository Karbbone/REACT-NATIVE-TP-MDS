import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from "react-native";
import { common, theme } from "../styles/theme";

export const Container: React.FC<ViewProps & { pad?: number }> = ({
  children,
  style,
  pad = 2,
  ...rest
}) => (
  <View
    style={[common.container, { padding: theme.spacing(pad) }, style]}
    {...rest}
  >
    {children}
  </View>
);

export const Title: React.FC<{
  children: React.ReactNode;
  level?: "lg" | "md";
}> = ({ children, level = "lg" }) => (
  <Text
    style={[
      styles.title,
      level === "md" && { fontSize: theme.typography.titleMd },
    ]}
  >
    {children}
  </Text>
);

export const Input: React.FC<TextInputProps> = ({ style, ...rest }) => (
  <TextInput
    style={[common.input, style]}
    placeholderTextColor={theme.colors.textSecondary}
    {...rest}
  />
);

export const Button: React.FC<
  TouchableOpacityProps & { variant?: "primary" | "alt" | "success" | "danger" }
> = ({ children, style, variant = "primary", ...rest }) => {
  const bg = {
    primary: theme.colors.primary,
    alt: theme.colors.primaryAlt,
    success: theme.colors.success,
    danger: theme.colors.danger,
  }[variant];
  return (
    <TouchableOpacity
      style={[common.buttonBase, { backgroundColor: bg }, style]}
      {...rest}
    >
      {typeof children === "string" ? (
        <Text style={common.buttonText}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

export const Chip: React.FC<TouchableOpacityProps & { active?: boolean }> = ({
  children,
  active,
  style,
  ...rest
}) => (
  <TouchableOpacity
    style={[
      common.chip,
      active && {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      },
      style,
    ]}
    {...rest}
  >
    <Text
      style={[
        { color: theme.colors.text },
        active && { color: "#fff", fontWeight: "600" },
      ]}
    >
      {children}
    </Text>
  </TouchableOpacity>
);

export const PageHeader: React.FC<{ title: string; right?: React.ReactNode }> = ({ title, right }) => (
  <View style={styles.headerWrapper}>
    <Text style={styles.headerTitle}>{title}</Text>
    {right && <View style={styles.headerRight}>{right}</View>}
  </View>
);

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.titleLg,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing(1.5),
  },
  headerWrapper: {
    paddingVertical: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
    borderBottomWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  headerTitle: {
    fontSize: theme.typography.titleLg,
    fontWeight: "700",
    color: theme.colors.text,
  },
  headerRight: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -theme.spacing(1) }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
});
