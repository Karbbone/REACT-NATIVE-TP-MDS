import React, { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, EmptyState, Input, LoadingSpinner } from "../components";
import { useDocuments } from "../contexts/DocumentContext";
import { common, theme } from "../styles/theme";

const CategoriesListView: React.FC = () => {
  const {
    categories,
    isLoadingCategories,
    createCategory,
    updateCategory,
    removeCategory,
    documents,
  } = useDocuments();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      await createCategory(trimmed);
      setName("");
    } catch (error: unknown) {
      Alert.alert("Erreur", "Impossible de créer la catégorie");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (id: string | number, current: string) => {
    setEditingId(id);
    setEditingName(current);
  };

  const saveEdit = async () => {
    if (editingId === null) return;

    try {
      await updateCategory(editingId, editingName);
      setEditingId(null);
      setEditingName("");
    } catch (error: unknown) {
      Alert.alert("Erreur", "Impossible de mettre à jour la catégorie");
    }
  };

  const deleteCat = async (id: string | number) => {
    const linked = documents.some((d) => d.categoryId === id);
    if (linked) {
      Alert.alert("Impossible", "Des documents utilisent cette catégorie.");
      return;
    }

    try {
      await removeCategory(id);
    } catch (error: unknown) {
      Alert.alert("Erreur", "Suppression impossible.");
    }
  };

  if (isLoadingCategories) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.newRow}>
        <Input
          placeholder="Nouvelle catégorie"
          value={name}
          onChangeText={setName}
          editable={!isSubmitting}
          containerStyle={{ flex: 1, marginBottom: 0 }}
        />
        <Button
          title="Ajouter"
          variant="primary"
          onPress={submit}
          isLoading={isSubmitting}
          fullWidth={false}
          style={{ paddingHorizontal: theme.spacing(2) }}
        />
      </View>
      <FlatList
        data={categories}
        keyExtractor={(c) => String(c.id)}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.catRow}>
              {editingId === item.id ? (
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={editingName}
                  onChangeText={setEditingName}
                />
              ) : (
                <Text style={styles.catName}>{item.nom}</Text>
              )}
              {editingId === item.id ? (
                <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                  <Text style={styles.btnTxt}>OK</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => startEdit(item.id, item.nom)}
                >
                  <Text style={styles.btnTxt}>Éditer</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteCat(item.id)}
              >
                <Text style={styles.btnTxt}>X</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState message="Aucune catégorie" icon="📋" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: common.container,
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  newRow: {
    flexDirection: "row",
    marginBottom: theme.spacing(1.5),
    gap: theme.spacing(1),
  },
  input: { ...common.input },
  addBtn: {
    ...common.buttonBase,
    backgroundColor: theme.colors.primary,
  },
  addTxt: common.buttonText,
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing(1.25),
    gap: theme.spacing(1),
  },
  catName: {
    flex: 1,
    fontSize: theme.typography.body,
    color: theme.colors.text,
  },
  editBtn: {
    ...common.buttonBase,
    backgroundColor: theme.colors.primaryAlt,
  },
  saveBtn: {
    ...common.buttonBase,
    backgroundColor: theme.colors.success,
  },
  deleteBtn: {
    ...common.buttonBase,
    backgroundColor: theme.colors.danger,
  },
  btnTxt: common.buttonText,
  empty: {
    textAlign: "center",
    marginTop: theme.spacing(3),
    color: theme.colors.textSecondary,
  },
});

export default CategoriesListView;
