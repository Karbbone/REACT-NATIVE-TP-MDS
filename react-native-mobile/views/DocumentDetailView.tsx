import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useDocuments } from "../contexts/DocumentContext";
import { RootStackParamList } from "../navigation/types";
import { common, theme } from "../styles/theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteParams = RootStackParamList["DocumentDetail"];

const DocumentDetailView: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<Nav>();
  const { byId, remove } = useDocuments();
  const { user, token } = useAuth();
  const { id } = route.params as RouteParams;
  const doc = byId(id);
  const [isDownloading, setIsDownloading] = useState(false);

  const API_BASE_URL = "http://10.0.2.2:8080";
  const imageUrl = doc?.id ? `${API_BASE_URL}/documents/${doc.id}/file` : null;

  if (!doc)
    return (
      <View style={styles.container}>
        <Text>Document introuvable.</Text>
      </View>
    );
  const isOwner = user?.id === doc.ownerId;

  const onDelete = () => {
    Alert.alert("Supprimer", "Confirmer la suppression ?", [
      { text: "Annuler" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          remove(doc.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{doc.title}</Text>

      {/* Informations du propriétaire */}
      <View style={styles.infoSection}>
        <Text style={styles.label}>Propriétaire:</Text>
        <Text style={styles.value}>
          {doc.ownerFirstName && doc.ownerLastName
            ? `${doc.ownerFirstName} ${doc.ownerLastName}`
            : doc.ownerEmail}
        </Text>
        <Text style={styles.valueSecondary}>{doc.ownerEmail}</Text>
      </View>

      {/* Catégorie */}
      {doc.categoryName && (
        <View style={styles.infoSection}>
          <Text style={styles.label}>Catégorie:</Text>
          <Text style={styles.value}>{doc.categoryName}</Text>
        </View>
      )}

      {/* Dates */}
      <View style={styles.infoSection}>
        <Text style={styles.label}>Déposé le:</Text>
        <Text style={styles.value}>
          {new Date(doc.createdAt).toLocaleString("fr-FR")}
        </Text>
        {doc.modifiedAt && doc.modifiedAt !== doc.createdAt && (
          <>
            <Text style={styles.label}>Modifié le:</Text>
            <Text style={styles.value}>
              {new Date(doc.modifiedAt).toLocaleString("fr-FR")}
            </Text>
          </>
        )}
      </View>

      {/* Description */}
      <View style={styles.infoSection}>
        <Text style={styles.label}>Description:</Text>
        <Text style={styles.content}>{doc.content}</Text>
      </View>

      {/* Fichier joint */}
      {doc.file && imageUrl && (
        <View style={styles.infoSection}>
          <Text style={styles.label}>Fichier joint:</Text>
          <Text style={styles.value}>
            {doc.file.name} ({doc.file.mimeType})
          </Text>
          {doc.file.size && (
            <Text style={styles.valueSecondary}>
              Taille: {(doc.file.size / 1024).toFixed(2)} KB
            </Text>
          )}

          {doc.file.mimeType?.startsWith("image/") && token ? (
            <Image
              source={{
                uri: imageUrl,
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <TouchableOpacity
              style={[styles.openBtn, isDownloading && styles.btnDisabled]}
              disabled={isDownloading}
              onPress={async () => {
                if (!token || !imageUrl) return;

                setIsDownloading(true);
                try {
                  // Télécharger le fichier localement
                  const fileExtension =
                    doc.file?.name.split(".").pop() || "pdf";
                  const fileUri = `${FileSystem.documentDirectory}${doc.id}.${fileExtension}`;

                  console.log("Téléchargement du fichier...");

                  const downloadResult = await FileSystem.downloadAsync(
                    imageUrl,
                    fileUri,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  console.log("Fichier téléchargé:", downloadResult.uri);

                  // Partager le fichier téléchargé
                  const available = await Sharing.isAvailableAsync();
                  if (available) {
                    await Sharing.shareAsync(downloadResult.uri);
                  } else {
                    Alert.alert("Ouverture non supportée sur cette plateforme");
                  }
                } catch (e) {
                  console.error("Erreur lors du téléchargement:", e);
                  Alert.alert("Erreur", "Impossible de télécharger le fichier");
                } finally {
                  setIsDownloading(false);
                }
              }}
            >
              {isDownloading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Ouvrir le fichier</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
      {isOwner && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate("DocumentForm", { id: doc.id })}
          >
            <Text style={styles.btnText}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
            <Text style={styles.btnText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...common.container,
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(10),
  },
  title: {
    fontSize: theme.typography.titleLg,
    fontWeight: "700",
    marginBottom: theme.spacing(2),
    color: theme.colors.text,
  },
  infoSection: {
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  label: {
    fontSize: theme.typography.small,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing(0.5),
    textTransform: "uppercase",
  },
  value: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing(0.5),
  },
  valueSecondary: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
  },
  content: {
    fontSize: theme.typography.body,
    lineHeight: 22,
    color: theme.colors.text,
  },
  image: {
    width: "100%",
    height: 300,
    marginTop: theme.spacing(1),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.borderLight,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  actions: {
    flexDirection: "row",
    marginTop: theme.spacing(3),
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(3),
  },
  editBtn: {
    ...common.buttonBase,
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  deleteBtn: {
    ...common.buttonBase,
    flex: 1,
    backgroundColor: theme.colors.danger,
  },
  openBtn: {
    ...common.buttonBase,
    backgroundColor: theme.colors.primaryAlt,
  },
  btnText: common.buttonText,
});

export default DocumentDetailView;
