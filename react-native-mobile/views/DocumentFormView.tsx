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

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Params = RootStackParamList["DocumentForm"];

const DocumentFormView: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<Nav>();
  const { id } = (route.params as Params) || {};
  const { byId, create, update } = useDocuments();
  const existing = id ? byId(id) : undefined;

  const [title, setTitle] = useState(existing?.title || "");
  const [content, setContent] = useState(existing?.content || "");
  const [file, setFile] = useState<DocumentFile | undefined>(existing?.file);

  useEffect(() => {
    navigation.setOptions({ title: existing ? "Modifier" : "Nouveau" });
  }, [existing, navigation]);

  const onSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Erreur", "Titre requis");
      return;
    }
    if (existing) {
      update(existing.id, { title, content, file });
    } else {
      create({ title, content, file });
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
      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: "#5856D6", marginTop: 8 }]}
        onPress={pickFile}
      >
        <Text style={styles.saveText}>Joindre un fichier</Text>
      </TouchableOpacity>
      {file && (
        <Text style={styles.fileMeta}>
          Fichier: {file.name} {file.mimeType ? `(${file.mimeType})` : ""}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  textArea: { height: 160, textAlignVertical: "top" },
  saveBtn: { backgroundColor: "#34C759", padding: 14, borderRadius: 8 },
  saveText: { color: "#fff", fontWeight: "600", textAlign: "center" },
  fileMeta: { marginTop: 8, color: "#444" },
});

export default DocumentFormView;
