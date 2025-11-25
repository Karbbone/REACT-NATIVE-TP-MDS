import { apiRequest } from "./api";

export interface Category {
  id: string | number;
  nom: string;
}

/**
 * Service pour gérer les catégories
 */
export const CategoryService = {
  /**
   * Récupère toutes les catégories
   */
  getAll: async (token: string): Promise<Category[]> => {
    const response = await apiRequest("/categories", {}, token);

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des catégories");
    }

    return response.json();
  },

  /**
   * Crée une nouvelle catégorie
   */
  create: async (name: string, token: string): Promise<Category> => {
    const response = await apiRequest(
      "/categories",
      {
        method: "POST",
        body: JSON.stringify({ nom: name }),
      },
      token
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la création de la catégorie");
    }

    return response.json();
  },

  /**
   * Met à jour une catégorie
   */
  update: async (
    id: string | number,
    name: string,
    token: string
  ): Promise<Category> => {
    const response = await apiRequest(
      `/categories/${id}`,
      {
        method: "PUT",
        body: JSON.stringify({ nom: name }),
      },
      token
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour de la catégorie");
    }

    return response.json();
  },

  /**
   * Supprime une catégorie
   */
  delete: async (id: string | number, token: string): Promise<void> => {
    const response = await apiRequest(
      `/categories/${id}`,
      {
        method: "DELETE",
      },
      token
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression de la catégorie");
    }
  },
};
