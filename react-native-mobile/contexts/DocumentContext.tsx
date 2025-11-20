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

export type DocumentItem = {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  ownerEmail: string;
  createdAt: string; // ISO
  file?: DocumentFile; // optionnel
};

type DocumentContextType = {
  documents: DocumentItem[];
  create: (
    data: Pick<DocumentItem, "title" | "content"> & { file?: DocumentFile }
  ) => void;
  update: (
    id: string,
    data: Partial<Pick<DocumentItem, "title" | "content" | "file">>
  ) => boolean;
  remove: (id: string) => boolean;
  byId: (id: string) => DocumentItem | undefined;
};

const DocumentContext = createContext<DocumentContextType>({
  documents: [],
  create: () => {},
  update: () => false,
  remove: () => false,
  byId: () => undefined,
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
    },
    {
      id: "d2",
      title: "Architecture Technique",
      content: "Découpage modules, flux et sécurité.",
      ownerId: "alice",
      ownerEmail: "alice@example.com",
      createdAt: new Date().toISOString(),
    },
  ]);

  const create: DocumentContextType["create"] = useCallback(
    ({ title, content, file }) => {
      if (!user) return;
      const doc: DocumentItem = {
        id: Math.random().toString(36).slice(2),
        title: title.trim(),
        content,
        ownerId: user.id,
        ownerEmail: user.email,
        createdAt: new Date().toISOString(),
        file,
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
          };
        })
      );
      const doc = documents.find((d) => d.id === id);
      return !!(user && doc && doc.ownerId === user.id);
    },
    [documents, user]
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
    () => ({ documents, create, update, remove, byId }),
    [documents, create, update, remove, byId]
  );

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => useContext(DocumentContext);
