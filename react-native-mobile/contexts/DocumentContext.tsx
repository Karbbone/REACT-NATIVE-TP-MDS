import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CategoryService, DocumentService } from "../services";
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
  ownerFirstName?: string;
  ownerLastName?: string;
  createdAt: string; // ISO
  modifiedAt?: string;
  file?: DocumentFile; // optionnel
  categoryId?: string | number; // référence catégorie
  categoryName?: string;
};

type DocumentContextType = {
  documents: DocumentItem[];
  categories: Category[];
  isLoadingCategories: boolean;
  isLoadingDocuments: boolean;
  fetchCategories: () => Promise<void>;
  fetchDocuments: () => Promise<void>;
  create: (
    data: Pick<DocumentItem, "title" | "content"> & {
      file?: DocumentFile;
      categoryId?: string | number;
    }
  ) => Promise<void>;
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
  isLoadingDocuments: false,
  fetchCategories: async () => {},
  fetchDocuments: async () => {},
  create: async () => {},
  update: () => false,
  remove: () => false,
  byId: () => undefined,
  createCategory: async () => {},
  updateCategory: async () => {},
  removeCategory: async () => {},
});

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, token } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  // Récupération des catégories depuis l'API
  const fetchCategories = useCallback(async () => {
    if (!token) return;

    setIsLoadingCategories(true);
    try {
      const data = await CategoryService.getAll(token);
      setCategories(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [token]);

  // Récupération des documents depuis l'API
  const fetchDocuments = useCallback(async () => {
    if (!token) return;

    setIsLoadingDocuments(true);
    try {
      const transformedDocs = await DocumentService.getAll(token);
      setDocuments(transformedDocs);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error);
    } finally {
      setIsLoadingDocuments(false);
    }
  }, [token]);

  // Charger les catégories et documents au montage et quand le token change
  React.useEffect(() => {
    if (token) {
      fetchCategories();
      fetchDocuments();
    }
  }, [token, fetchCategories, fetchDocuments]);

  const create: DocumentContextType["create"] = useCallback(
    async ({ title, content, file, categoryId }) => {
      if (!user || !token) return;

      try {
        const transformedDoc = await DocumentService.create(
          title,
          content,
          file,
          categoryId,
          token
        );

        // Ajouter le document localement
        setDocuments((prev) => [transformedDoc, ...prev]);
      } catch (error) {
        console.error("Erreur lors de la création du document:", error);
        throw error;
      }
    },
    [user, token]
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
        await CategoryService.create(name, token);
        await fetchCategories(); // Recharger la liste
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
        await CategoryService.update(id, name, token);
        await fetchCategories(); // Recharger la liste
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
        await CategoryService.delete(id, token);
        await fetchCategories(); // Recharger la liste
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
      isLoadingDocuments,
      fetchCategories,
      fetchDocuments,
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
      isLoadingDocuments,
      fetchCategories,
      fetchDocuments,
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
