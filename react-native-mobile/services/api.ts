// Configuration de base pour les appels API
const API_BASE_URL = "http://10.0.2.2:8080";

/**
 * Effectue une requête HTTP avec authentification
 */
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<Response> => {
  const headers: HeadersInit = {
    ...options.headers,
  };

  // Ajouter le token d'authentification si disponible
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Ajouter Content-Type sauf pour FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};
