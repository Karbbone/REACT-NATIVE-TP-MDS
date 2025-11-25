import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button, CategoryChip, Input } from "../components";
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
  const [categoryId, setCategoryId] = useState<string | number | undefined>(
    existing?.categoryId
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: existing ? "Modifier" : "Nouveau" });
  }, [existing, navigation]);

  const onSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Erreur", "Titre requis");
      return;
    }

    setIsSubmitting(true);
    try {
      if (existing) {
        update(existing.id, { title, content, file, categoryId });
      } else {
        await create({ title, content, file, categoryId });
      }
      navigation.goBack();
    } catch (error: unknown) {
      console.error("Erreur lors de la sauvegarde:", error);
      Alert.alert("Erreur", "Impossible de sauvegarder le document");
    } finally {
      setIsSubmitting(false);
    }
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

  const takePhoto = async () => {
    // Demander la permission d'accès à la caméra
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission refusée",
        "Vous devez autoriser l'accès à la caméra pour prendre une photo."
      );
      return;
    }

    // Ouvrir la caméra
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const photo = result.assets[0];
      setFile({
        uri: photo.uri,
        name: `photo_${Date.now()}.jpg`,
        mimeType: "image/jpeg",
        size: photo.fileSize,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Input placeholder="Titre" value={title} onChangeText={setTitle} />
      <Input
        placeholder="Contenu"
        value={content}
        onChangeText={setContent}
        multiline
        style={styles.textArea}
      />
      <Button
        title={existing ? "Enregistrer" : "Créer"}
        variant="success"
        onPress={onSubmit}
        isLoading={isSubmitting}
      />
      <View style={styles.fileButtonsContainer}>
        <Button
          title="📷 Photo"
          variant="secondary"
          onPress={takePhoto}
          fullWidth={false}
          style={styles.halfButton}
        />
        <Button
          title="📎 Fichier"
          variant="secondary"
          onPress={pickFile}
          fullWidth={false}
          style={styles.halfButton}
        />
      </View>
      {file && (
        <Text style={styles.fileMeta}>
          Fichier: {file.name} {file.mimeType ? `(${file.mimeType})` : ""}
        </Text>
      )}
      <Text style={styles.sectionLabel}>🏷️ Catégorie</Text>
      <View style={styles.catContainer}>
        {categories.map((c) => (
          <CategoryChip
            key={c.id}
            label={c.nom}
            selected={categoryId === c.id}
            onPress={() =>
              setCategoryId(categoryId === c.id ? undefined : c.id)
            }
          />
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
  textArea: { height: 160, textAlignVertical: "top" },
  fileButtonsContainer: {
    flexDirection: "row",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  halfButton: {
    flex: 1,
  },
  fileMeta: { marginTop: theme.spacing(1), color: theme.colors.textSecondary },
  sectionLabel: {
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(1),
    fontWeight: "700",
    fontSize: 18,
    color: theme.colors.text,
  },
  catContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing(1),
  },
  emptyCats: { color: theme.colors.textSecondary },
});

export default DocumentFormView;
