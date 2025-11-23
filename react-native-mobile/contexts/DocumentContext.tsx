import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

export type DocumentFile = {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
};

export type Category = {
  id: string | number;
  nom: string;
};

export type DocumentItem = {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  ownerEmail: string;
  createdAt: string; // ISO
  file?: DocumentFile; // optionnel
  categoryId?: string; // référence catégorie
};

type DocumentContextType = {
  documents: DocumentItem[];
  categories: Category[];
  isLoadingCategories: boolean;
  fetchCategories: () => Promise<void>;
  create: (
    data: Pick<DocumentItem, "title" | "content"> & {
      file?: DocumentFile;
      categoryId?: string;
    }
  ) => void;
  update: (
    id: string,
    data: Partial<
      Pick<DocumentItem, "title" | "content" | "file" | "categoryId">
    >
  ) => boolean;
  remove: (id: string) => boolean;
  byId: (id: string) => DocumentItem | undefined;
  // Catégories CRUD
  createCategory: (name: string) => Promise<void>;
  updateCategory: (id: string | number, name: string) => Promise<void>;
  removeCategory: (id: string | number) => Promise<void>;
};

const DocumentContext = createContext<DocumentContextType>({
  documents: [],
  categories: [],
  isLoadingCategories: false,
  fetchCategories: async () => {},
  create: () => {},
  update: () => false,
  remove: () => false,
  byId: () => undefined,
  createCategory: async () => {},
  updateCategory: async () => {},
  removeCategory: async () => {},
});

// Pour Android Emulator: utilisez 10.0.2.2
// Pour iOS Simulator: utilisez localhost
// Pour appareil physique: utilisez l'IP de votre machine (ex: 192.168.1.X)
const API_BASE_URL = "http://10.0.2.2:8080";

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, token } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: "d1",
      title: "Spécification Fonctionnelle",
      content: "Description initiale du besoin métier...",
      ownerId: "cleme",
      ownerEmail: "cleme@example.com",
      createdAt: new Date().toISOString(),
      categoryId: "c2",
    },
    {
      id: "d2",
      title: "Architecture Technique",
      content: "Découpage modules, flux et sécurité.",
      ownerId: "alice",
      ownerEmail: "alice@example.com",
      createdAt: new Date().toISOString(),
      categoryId: "c1",
    },
  ]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Récupération des catégories depuis l'API
  const fetchCategories = useCallback(async () => {
    if (!token) return;

    setIsLoadingCategories(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [token]);

  // Charger les catégories au montage et quand le token change
  React.useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token, fetchCategories]);

  const create: DocumentContextType["create"] = useCallback(
    ({ title, content, file, categoryId }) => {
      if (!user) return;
      const doc: DocumentItem = {
        id: Math.random().toString(36).slice(2),
        title: title.trim(),
        content,
        ownerId: user.id,
        ownerEmail: user.email,
        createdAt: new Date().toISOString(),
        file,
        categoryId,
      };
      setDocuments((prev) => [doc, ...prev]);
    },
    [user]
  );

  const update: DocumentContextType["update"] = useCallback(
    (id, changes) => {
      setDocuments((prev) =>
        prev.map((d) => {
          if (d.id !== id) return d;
          if (!user || d.ownerId !== user.id) return d;
          return {
            ...d,
            title: changes.title?.trim() ?? d.title,
            content: changes.content ?? d.content,
            file: changes.file ?? d.file,
            categoryId: changes.categoryId ?? d.categoryId,
          };
        })
      );
      const doc = documents.find((d) => d.id === id);
      return !!(user && doc && doc.ownerId === user.id);
    },
    [documents, user]
  );
  // Catégories CRUD avec API
  const createCategory: DocumentContextType["createCategory"] = useCallback(
    async (name) => {
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nom: name.trim() }),
        });

        if (response.ok) {
          await fetchCategories(); // Recharger la liste
        }
      } catch (error) {
        console.error("Erreur lors de la création de la catégorie:", error);
        throw error;
      }
    },
    [token, fetchCategories]
  );

  const updateCategory: DocumentContextType["updateCategory"] = useCallback(
    async (id, name) => {
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nom: name.trim() }),
        });

        if (response.ok) {
          await fetchCategories(); // Recharger la liste
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la catégorie:", error);
        throw error;
      }
    },
    [token, fetchCategories]
  );

  const removeCategory: DocumentContextType["removeCategory"] = useCallback(
    async (id) => {
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          await fetchCategories(); // Recharger la liste
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la catégorie:", error);
        throw error;
      }
    },
    [token, fetchCategories]
  );

  const remove: DocumentContextType["remove"] = useCallback(
    (id) => {
      const doc = documents.find((d) => d.id === id);
      if (!user || !doc || doc.ownerId !== user.id) return false;
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      return true;
    },
    [documents, user]
  );

  const byId = useCallback(
    (id: string) => documents.find((d) => d.id === id),
    [documents]
  );

  const value = useMemo(
    () => ({
      documents,
      categories,
      isLoadingCategories,
      fetchCategories,
      create,
      update,
      remove,
      byId,
      createCategory,
      updateCategory,
      removeCategory,
    }),
    [
      documents,
      categories,
      isLoadingCategories,
      fetchCategories,
      create,
      update,
      remove,
      byId,
      createCategory,
      updateCategory,
      removeCategory,
    ]
  );

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => useContext(DocumentContext);
