import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Card,
  CategoryChip,
  EmptyState,
  Input,
  LoadingSpinner,
} from "../components";
import { useDocuments } from "../contexts/DocumentContext";
import { RootStackParamList } from "../navigation/types";
import { common, theme } from "../styles/theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DocumentsListView: React.FC = () => {
  const { documents, categories, isLoadingDocuments } = useDocuments();
  const [activeCategory, setActiveCategory] = useState<
    string | number | undefined
  >();
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

  if (isLoadingDocuments) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <Input
        placeholder="🔍 Rechercher titre / contenu / auteur"
        value={query}
        onChangeText={setQuery}
      />
      <Button
        title="✨ Nouveau document"
        variant="primary"
        onPress={() => navigation.navigate("DocumentForm", {})}
        style={{ marginBottom: theme.spacing(1.5) }}
      />
      <View style={styles.catBar}>
        {categories.map((c) => (
          <CategoryChip
            key={c.id}
            label={c.nom}
            selected={activeCategory === c.id}
            onPress={() =>
              setActiveCategory(activeCategory === c.id ? undefined : c.id)
            }
          />
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("DocumentDetail", { id: item.id })
              }
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>
                Par {item.ownerEmail} •{" "}
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </Card>
        )}
        ListEmptyComponent={<EmptyState message="Aucun document" icon="📄" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: common.container,
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing(2),
  },
  catBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
  },
  title: {
    fontSize: theme.typography.titleMd,
    fontWeight: "600",
    marginBottom: 4,
    color: theme.colors.text,
  },
  meta: { fontSize: theme.typography.small, color: theme.colors.textSecondary },
});

export default DocumentsListView;
