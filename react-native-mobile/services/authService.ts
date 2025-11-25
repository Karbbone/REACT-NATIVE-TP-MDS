import { apiRequest } from "./api";

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Service pour gérer l'authentification des utilisateurs
 */
export const AuthService = {
  /**
   * Connexion d'un utilisateur
   */
  login: async (
    email: string,
    password: string
  ): Promise<UserLoginResponse> => {
    console.log(`Tentative de connexion pour: ${email}`);

    const response = await apiRequest("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur API:", errorText);
      throw new Error("Identifiants incorrects");
    }

    const data = await response.json();
    console.log("Connexion réussie");
    return data;
  },
};
