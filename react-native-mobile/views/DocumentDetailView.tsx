import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Sharing from "expo-sharing";
import React from "react";
import {
  Alert,
  Image,
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
  const { user } = useAuth();
  const { id } = route.params as RouteParams;
  const doc = byId(id);

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
    <View style={styles.container}>
      <Text style={styles.title}>{doc.title}</Text>
      <Text style={styles.meta}>
        Propriétaire: {doc.ownerId} • {new Date(doc.createdAt).toLocaleString()}
      </Text>
      <Text style={styles.content}>{doc.content}</Text>
      {doc.file && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ marginBottom: 8 }}>
            Pièce jointe: {doc.file.name}{" "}
            {doc.file.mimeType ? `(${doc.file.mimeType})` : ""}
          </Text>
          {doc.file.mimeType?.startsWith("image/") ? (
            <Image
              source={{ uri: doc.file.uri }}
              style={{ width: "100%", height: 200, borderRadius: 8 }}
              resizeMode="contain"
            />
          ) : (
            <TouchableOpacity
              style={styles.openBtn}
              onPress={async () => {
                try {
                  const available = await Sharing.isAvailableAsync();
                  if (available) await Sharing.shareAsync(doc.file!.uri);
                  else
                    Alert.alert("Ouverture non supportée sur cette plateforme");
                } catch (e) {
                  console.error(e);
                  Alert.alert("Erreur", "Impossible d'ouvrir le fichier");
                }
              }}
            >
              <Text style={styles.btnText}>Ouvrir la pièce jointe</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: common.container,
  title: {
    fontSize: theme.typography.titleLg,
    fontWeight: "700",
    marginBottom: theme.spacing(1),
    color: theme.colors.text,
  },
  meta: {
    fontSize: theme.typography.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing(2),
  },
  content: {
    fontSize: theme.typography.body,
    lineHeight: 20,
    color: theme.colors.text,
  },
  actions: {
    flexDirection: "row",
    marginTop: theme.spacing(3),
    gap: theme.spacing(1.5),
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
