import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

const ProfileView: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{user?.email}</Text>
      <TouchableOpacity style={styles.btn} onPress={logout}>
        <Text style={styles.btnText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 24 },
  label: { fontSize: 14, color: "#555" },
  value: { fontSize: 16, marginBottom: 32 },
  btn: { backgroundColor: "#FF3B30", padding: 14, borderRadius: 8 },
  btnText: { color: "#fff", fontWeight: "600", textAlign: "center" },
});

export default ProfileView;
