import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DocumentFile, useDocuments } from "../contexts/DocumentContext";
import { RootStackParamList } from "../navigation/types";
import { common, theme } from "../styles/theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Params = RootStackParamList["DocumentForm"];

const DocumentFormView: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<Nav>();
  const { id } = (route.params as Params) || {};
  const { byId, create, update, categories } = useDocuments();
  const existing = id ? byId(id) : undefined;

  const [title, setTitle] = useState(existing?.title || "");
  const [content, setContent] = useState(existing?.content || "");
  const [file, setFile] = useState<DocumentFile | undefined>(existing?.file);
  const [categoryId, setCategoryId] = useState<string | undefined>(
    existing?.categoryId
  );

  useEffect(() => {
    navigation.setOptions({ title: existing ? "Modifier" : "Nouveau" });
  }, [existing, navigation]);

  const onSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Erreur", "Titre requis");
      return;
    }
    if (existing) {
      update(existing.id, { title, content, file, categoryId });
    } else {
      create({ title, content, file, categoryId });
    }
    navigation.goBack();
  };

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (!res.canceled && res.assets && res.assets.length > 0) {
      const a = res.assets[0];
      setFile({
        uri: a.uri,
        name: a.name ?? "fichier",
        mimeType: a.mimeType ?? undefined,
        size: a.size ?? undefined,
      });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Titre"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Contenu"
        value={content}
        onChangeText={setContent}
        multiline
      />
      <TouchableOpacity style={styles.saveBtn} onPress={onSubmit}>
        <Text style={styles.saveText}>
          {existing ? "Enregistrer" : "Créer"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.attachBtn]} onPress={pickFile}>
        <Text style={styles.saveText}>Joindre un fichier</Text>
      </TouchableOpacity>
      {file && (
        <Text style={styles.fileMeta}>
          Fichier: {file.name} {file.mimeType ? `(${file.mimeType})` : ""}
        </Text>
      )}
      <Text style={styles.sectionLabel}>Catégorie</Text>
      <View style={styles.catContainer}>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[
              styles.catChip,
              categoryId === c.id && styles.catChipSelected,
            ]}
            onPress={() =>
              setCategoryId(categoryId === c.id ? undefined : c.id)
            }
          >
            <Text
              style={[
                styles.catChipText,
                categoryId === c.id && styles.catChipTextSelected,
              ]}
            >
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
        {categories.length === 0 && (
          <Text style={styles.emptyCats}>
            Aucune catégorie (créez-en dans l'onglet Catégories)
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: common.container,
  input: { ...common.input, marginBottom: theme.spacing(1.5) },
  textArea: { height: 160, textAlignVertical: "top" },
  saveBtn: { ...common.buttonBase, backgroundColor: theme.colors.success },
  attachBtn: {
    ...common.buttonBase,
    backgroundColor: theme.colors.primaryAlt,
    marginTop: theme.spacing(1),
  },
  saveText: common.buttonText,
  fileMeta: { marginTop: theme.spacing(1), color: theme.colors.textSecondary },
  sectionLabel: {
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(1),
    fontWeight: "600",
    fontSize: theme.typography.body,
    color: theme.colors.text,
  },
  catContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing(1),
  },
  catChip: common.chip,
  catChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  catChipText: { color: theme.colors.text },
  catChipTextSelected: { color: "#fff", fontWeight: "600" },
  emptyCats: { color: theme.colors.textSecondary },
});

export default DocumentFormView;
