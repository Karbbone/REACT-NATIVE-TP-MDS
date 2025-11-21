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
import { useDocuments } from "../contexts/DocumentContext";
import { common, theme } from "../styles/theme";

const CategoriesListView: React.FC = () => {
  const {
    categories,
    createCategory,
    updateCategory,
    removeCategory,
    documents,
  } = useDocuments();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    createCategory(trimmed);
    setName("");
  };

  const startEdit = (id: string, current: string) => {
    setEditingId(id);
    setEditingName(current);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const ok = updateCategory(editingId, editingName);
    if (!ok) Alert.alert("Erreur", "Catégorie introuvable");
    setEditingId(null);
    setEditingName("");
  };

  const deleteCat = (id: string) => {
    const linked = documents.some((d) => d.categoryId === id);
    if (linked) {
      Alert.alert("Impossible", "Des documents utilisent cette catégorie.");
      return;
    }
    const ok = removeCategory(id);
    if (!ok) Alert.alert("Erreur", "Suppression impossible.");
  };

  return (
    <View style={styles.container}>
      <View style={styles.newRow}>
        <TextInput
          style={styles.input}
          placeholder="Nouvelle catégorie"
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity style={styles.addBtn} onPress={submit}>
          <Text style={styles.addTxt}>Ajouter</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={categories}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <View style={styles.catRow}>
            {editingId === item.id ? (
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={editingName}
                onChangeText={setEditingName}
              />
            ) : (
              <Text style={styles.catName}>{item.name}</Text>
            )}
            {editingId === item.id ? (
              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                <Text style={styles.btnTxt}>OK</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => startEdit(item.id, item.name)}
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
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucune catégorie</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: common.container,
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
