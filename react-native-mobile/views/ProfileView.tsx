import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { common, theme } from "../styles/theme";

const ProfileView: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{user?.email}</Text>
      <TouchableOpacity style={styles.btn} onPress={logout}>
        <Text style={styles.btnText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...common.container, padding: theme.spacing(2) },
  label: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
  },
  value: {
    fontSize: theme.typography.body,
    marginBottom: theme.spacing(4),
    color: theme.colors.text,
  },
  btn: { ...common.buttonBase, backgroundColor: theme.colors.danger },
  btnText: common.buttonText,
});

export default ProfileView;
