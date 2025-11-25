import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../components";
import { useAuth } from "../contexts/AuthContext";
import { common, theme } from "../styles/theme";

const ProfileView: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.userName}>Mon Profil</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.label}>📧 Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>
      <Button title="Se déconnecter" variant="danger" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...common.container, padding: theme.spacing(2) },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingVertical: theme.spacing(3),
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: theme.spacing(2),
    borderRadius: 12,
    marginBottom: theme.spacing(3),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing(0.5),
    fontWeight: "600",
  },
  value: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    fontWeight: "500",
  },
});

export default ProfileView;
