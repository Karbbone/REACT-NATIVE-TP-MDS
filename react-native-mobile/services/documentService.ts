import { apiRequest } from "./api";

export interface DocumentFile {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  ownerEmail: string;
  ownerFirstName?: string;
  ownerLastName?: string;
  createdAt: string;
  modifiedAt?: string;
  file?: DocumentFile;
  categoryId?: string | number;
  categoryName?: string;
}

interface ApiDocument {
  id: string;
  titre: string;
  description: string;
  cheminFichier?: string;
  typeFichier?: string;
  taille?: number;
  proprietaire: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  categorie?: {
    id: number;
    nom: string;
  };
  dateDepot: string;
  dateModification?: string;
}

/**
 * Transforme un document de l'API au format de l'application
 */
const transformApiDocument = (apiDoc: ApiDocument): DocumentItem => ({
  id: apiDoc.id,
  title: apiDoc.titre || "",
  content: apiDoc.description || "",
  ownerId: apiDoc.proprietaire?.id || "",
  ownerEmail: apiDoc.proprietaire?.email || "",
  ownerFirstName: apiDoc.proprietaire?.firstName,
  ownerLastName: apiDoc.proprietaire?.lastName,
  createdAt: apiDoc.dateDepot || new Date().toISOString(),
  modifiedAt: apiDoc.dateModification,
  categoryId: apiDoc.categorie?.id,
  categoryName: apiDoc.categorie?.nom,
  file: apiDoc.cheminFichier
    ? {
        uri: apiDoc.cheminFichier,
        name: apiDoc.cheminFichier.split("/").pop() || "fichier",
        mimeType: apiDoc.typeFichier,
        size: apiDoc.taille,
      }
    : undefined,
});

/**
 * Service pour gérer les documents
 */
export const DocumentService = {
  /**
   * Récupère tous les documents
   */
  getAll: async (token: string): Promise<DocumentItem[]> => {
    const response = await apiRequest("/documents", {}, token);

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des documents");
    }

    const apiDocs: ApiDocument[] = await response.json();
    return apiDocs.map(transformApiDocument);
  },

  /**
   * Crée un nouveau document
   */
  create: async (
    title: string,
    content: string,
    file: DocumentFile | undefined,
    categoryId: string | number | undefined,
    token: string
  ): Promise<DocumentItem> => {
    const formData = new FormData();
    formData.append("titre", title.trim());
    formData.append("description", content);

    if (categoryId !== undefined) {
      formData.append("categorieId", String(categoryId));
    }

    if (file) {
      const fileToUpload: any = {
        uri: file.uri,
        type: file.mimeType || "application/octet-stream",
        name: file.name,
      };
      formData.append("file", fileToUpload);
    }

    console.log("Création de document:", title);

    const response = await apiRequest(
      "/documents",
      {
        method: "POST",
        body: formData,
      },
      token
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur API:", errorText);
      throw new Error("Impossible de créer le document");
    }

    const apiDoc: ApiDocument = await response.json();
    console.log("Document créé avec succès:", apiDoc);

    return transformApiDocument(apiDoc);
  },

  /**
   * Supprime un document
   */
  delete: async (id: string, token: string): Promise<void> => {
    const response = await apiRequest(
      `/documents/${id}`,
      {
        method: "DELETE",
      },
      token
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression du document");
    }
  },
};
