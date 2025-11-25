import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Input } from "../components";
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const RegisterView: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onRegister = async () => {
    if (!email || !firstName || !lastName || !password || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://10.0.2.2:8080/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password,
        }),
      });

      if (response.ok) {
        Alert.alert(
          "Succès",
          "Compte créé avec succès ! Vous pouvez maintenant vous connecter.",
          [
            {
              text: "OK",
              onPress: () => {
                // Connexion automatique après inscription
                login(email, password).catch(() => {
                  navigation.navigate("Login");
                });
              },
            },
          ]
        );
      } else {
        const errorData = await response.text();
        Alert.alert("Erreur", errorData || "Impossible de créer le compte");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Une erreur est survenue";
      Alert.alert("Erreur", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.icon}>✨</Text>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez-nous dès maintenant</Text>
        </View>
        <View style={styles.form}>
          <Input
            label="Prénom"
            placeholder="Prénom"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
          <Input
            label="Nom"
            placeholder="Nom"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />
          <Input
            label="Email"
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Mot de passe"
            placeholder="Mot de passe (min. 8 caractères)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Input
            label="Confirmer le mot de passe"
            placeholder="Confirmer le mot de passe"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Button
            title="S'inscrire"
            variant="success"
            onPress={onRegister}
            isLoading={isLoading}
          />
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginText}>
              Déjà un compte ? <Text style={styles.loginTextBold}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#28a745",
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    fontSize: 48,
    textAlign: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  form: {
    padding: 24,
    marginTop: 20,
  },
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#6c757d",
  },
  loginTextBold: {
    fontWeight: "700",
    color: "#007AFF",
  },
});

export default RegisterView;
