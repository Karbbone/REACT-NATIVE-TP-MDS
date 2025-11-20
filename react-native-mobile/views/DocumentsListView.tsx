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

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DocumentsListView: React.FC = () => {
  const { documents } = useDocuments();
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return documents.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        d.ownerId.toLowerCase().includes(q)
    );
  }, [query, documents]);

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
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  search: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  createBtn: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  createText: { color: "#fff", fontWeight: "600", textAlign: "center" },
  item: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  meta: { fontSize: 12, color: "#666" },
  empty: { textAlign: "center", marginTop: 24, color: "#666" },
});

export default DocumentsListView;
