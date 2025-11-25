import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import { common, theme } from "../styles/theme";

export type ButtonVariant = "primary" | "success" | "danger" | "secondary";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  isLoading = false,
  fullWidth = true,
  disabled,
  style,
  ...props
}) => {
  const buttonStyle: ViewStyle[] = [common.buttonBase, styles[variant]];

  if (fullWidth) {
    buttonStyle.push(styles.fullWidth);
  }

  if (disabled || isLoading) {
    buttonStyle.push(styles.disabled);
  }

  if (style) {
    buttonStyle.push(style as ViewStyle);
  }

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={common.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primary: {
    backgroundColor: theme.colors.primary,
  },
  success: {
    backgroundColor: theme.colors.success,
  },
  danger: {
    backgroundColor: theme.colors.danger,
  },
  secondary: {
    backgroundColor: theme.colors.primaryAlt,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.6,
  },
});
