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
  id: string;
  name: string;
  createdAt: string;
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
  createCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => boolean;
  removeCategory: (id: string) => boolean; // refuse si documents liés
};

const DocumentContext = createContext<DocumentContextType>({
  documents: [],
  categories: [],
  create: () => {},
  update: () => false,
  remove: () => false,
  byId: () => undefined,
  createCategory: () => {},
  updateCategory: () => false,
  removeCategory: () => false,
});

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: "d1",
      title: "Spécification Fonctionnelle",
      content: "Description initiale du besoin métier...",
      ownerId: "cleme",
      ownerEmail: "cleme@example.com",
      createdAt: new Date().toISOString(),
      categoryId: "c2", // Fonctionnel
    },
    {
      id: "d2",
      title: "Architecture Technique",
      content: "Découpage modules, flux et sécurité.",
      ownerId: "alice",
      ownerEmail: "alice@example.com",
      createdAt: new Date().toISOString(),
      categoryId: "c1", // Architecture
    },
  ]);
  const [categories, setCategories] = useState<Category[]>([
    { id: "c1", name: "Architecture", createdAt: new Date().toISOString() },
    { id: "c2", name: "Fonctionnel", createdAt: new Date().toISOString() },
  ]);

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
  // Catégories
  const createCategory: DocumentContextType["createCategory"] = useCallback(
    (name) => {
      const cat: Category = {
        id: Math.random().toString(36).slice(2),
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };
      setCategories((prev) => [cat, ...prev]);
    },
    []
  );

  const updateCategory: DocumentContextType["updateCategory"] = useCallback(
    (id, name) => {
      let exists = false;
      setCategories((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            exists = true;
            return { ...c, name: name.trim() };
          }
          return c;
        })
      );
      return exists;
    },
    []
  );

  const removeCategory: DocumentContextType["removeCategory"] = useCallback(
    (id) => {
      // refuse suppression si documents liés
      const hasDocs = documents.some((d) => d.categoryId === id);
      if (hasDocs) return false;
      const before = categories.length;
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return categories.length !== before;
    },
    [documents, categories]
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
