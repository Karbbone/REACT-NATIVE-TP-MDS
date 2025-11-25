import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AuthService } from "../services";

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
      const data = await AuthService.login(email, password);

      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      console.error("Erreur de connexion:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erreur de connexion";

      // Message d'erreur plus détaillé pour les problèmes réseau
      if (err instanceof TypeError && err.message.includes("Network")) {
        setError(
          "Impossible de contacter le serveur. Vérifiez que l'API est démarrée et l'URL correcte."
        );
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
      const headers: HeadersInit = {
        ...options.headers,
        "Content-Type": "application/json",
      };

      if (token) {
        (headers as Record<string, string>)[
          "Authorization"
        ] = `Bearer ${token}`;
      }

      return fetch(url, {
        ...options,
        headers,
      });
    },
    [token]
  );
};
