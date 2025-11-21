import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDocuments } from "../contexts/DocumentContext";
import { RootStackParamList } from "../navigation/types";
import { common, theme } from "../styles/theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DocumentsListView: React.FC = () => {
  const { documents, categories } = useDocuments();
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return documents.filter((d) => {
      const matchesText =
        d.title.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        d.ownerId.toLowerCase().includes(q);
      const matchesCat = !activeCategory || d.categoryId === activeCategory;
      return matchesText && matchesCat;
    });
  }, [query, documents, activeCategory]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Rechercher titre / contenu / auteur"
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => navigation.navigate("DocumentForm", {})}
      >
        <Text style={styles.createText}>+ Nouveau document</Text>
      </TouchableOpacity>
      <View style={styles.catBar}>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[
              styles.catChip,
              activeCategory === c.id && styles.catChipActive,
            ]}
            onPress={() =>
              setActiveCategory(activeCategory === c.id ? undefined : c.id)
            }
          >
            <Text
              style={[
                styles.catChipText,
                activeCategory === c.id && styles.catChipTextActive,
              ]}
            >
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate("DocumentDetail", { id: item.id })
            }
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>
              Par {item.ownerId} •{" "}
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucun document</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: common.container,
  search: {
    ...common.input,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing(1.5),
    height: 44,
  },
  createBtn: {
    ...common.buttonBase,
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing(1.5),
  },
  catBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
  },
  catChip: {
    ...common.chip,
  },
  catChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  catChipText: { color: theme.colors.text },
  catChipTextActive: { color: "#fff", fontWeight: "600" },
  createText: common.buttonText,
  item: {
    padding: theme.spacing(1.5),
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing(1.25),
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: theme.typography.titleMd,
    fontWeight: "600",
    marginBottom: 4,
    color: theme.colors.text,
  },
  meta: { fontSize: theme.typography.small, color: theme.colors.textSecondary },
  empty: {
    textAlign: "center",
    marginTop: theme.spacing(3),
    color: theme.colors.textSecondary,
  },
});

export default DocumentsListView;
