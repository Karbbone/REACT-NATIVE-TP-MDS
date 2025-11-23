import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  isLoading: false,
  error: null,
});

// Pour Android Emulator: utilisez 10.0.2.2
// Pour iOS Simulator: utilisez localhost
// Pour appareil physique: utilisez l'IP de votre machine (ex: 192.168.1.X)
const API_BASE_URL = "http://10.0.2.2:8080";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Tentative de connexion à: ${API_BASE_URL}/users/login`);
      
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Statut de la réponse:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur API:", errorText);
        throw new Error("Identifiants incorrects");
      }

      const data = await response.json();
      console.log("Connexion réussie");

      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      console.error("Erreur de connexion:", err);
      const errorMessage = err instanceof Error ? err.message : "Erreur de connexion";
      
      // Message d'erreur plus détaillé pour les problèmes réseau
      if (err instanceof TypeError && err.message.includes("Network")) {
        setError("Impossible de contacter le serveur. Vérifiez que l'API est démarrée et l'URL correcte.");
      } else {
        setError(errorMessage);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, login, logout, isLoading, error }),
    [user, token, login, logout, isLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

// Hook pour faire des requêtes authentifiées
export const useAuthenticatedFetch = () => {
  const { token } = useAuth();

  return useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = {
        ...options.headers,
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      return fetch(url, {
        ...options,
        headers,
      });
    },
    [token]
  );
};
