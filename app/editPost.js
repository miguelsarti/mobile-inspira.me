import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import API_URL from "../utils/api";

const palette = ["#f0f0f0", "#A6C8E0", "#8BB9D4", "#5D8AA8"];

const getRelationCategoryId = (relation) => {
  if (!relation) return null;
  const value = relation.categoryId ?? relation.category?.id;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeCategoryId = (value) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export default function EditPostScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const userId = useMemo(() => (typeof user?.id === "number" ? user.id : Number(user?.id)), [user?.id]);
  const goBackSafely = () => {
    if (router.canGoBack?.()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    description: "",
    ownerPost: "",
    backgroundColor: palette[0],
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [existingRelations, setExistingRelations] = useState([]);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [errors, setErrors] = useState({});
  const [successVisible, setSuccessVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchPost = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/posts/${id}`);
        if (!response.ok) {
          throw new Error("Não foi possível carregar a postagem.");
        }
        const post = await response.json();
        if (!isMounted) return;

        if (!userId || Number(post.userId) !== userId) {
          Alert.alert("Ops", "Você não tem permissão para editar esta postagem.", [
            { text: "OK", onPress: goBackSafely },
          ]);
          return;
        }

        const relations = Array.isArray(post.categories) ? post.categories : [];
        setForm({
          description: post.description || "",
          ownerPost: post.ownerPost || user?.name || "",
          backgroundColor: post.backgroundColor || palette[0],
        });
        const selectedFromPost = relations
          .map((rel) => getRelationCategoryId(rel))
          .filter((value) => value !== null);
        setExistingRelations(relations);
        setSelectedCategories(selectedFromPost);
      } catch (error) {
        if (!isMounted) return;
        Alert.alert("Erro", error.message || "Falha ao carregar a postagem.", [
          { text: "OK", onPress: goBackSafely },
        ]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [id, userId, router, user?.name]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      setIsFetchingCategories(true);
      try {
        const response = await fetch(`${API_URL}/categorias`);
        if (!response.ok) {
          throw new Error("Erro ao buscar categorias");
        }
        const data = await response.json();
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : [];
        setCategories(list);
        setSelectedCategories((prev) => {
          if (prev.length) {
            const valid = prev.filter((id) =>
              list.some((cat) => Number(cat.id) === Number(id))
            );
            if (valid.length) {
              return valid;
            }
          }
          const firstId = list[0]?.id;
          if (firstId == null) {
            return [];
          }
          const normalized = normalizeCategoryId(firstId);
          return normalized !== null ? [normalized] : [firstId];
        });
      } catch (error) {
        if (isMounted) {
          Alert.alert("Erro", "Não foi possível carregar as categorias.");
        }
      } finally {
        if (isMounted) {
          setIsFetchingCategories(false);
        }
      }
    };

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleCategory = (categoryId) => {
    const normalizedId = normalizeCategoryId(categoryId);
    const safeId = normalizedId !== null ? normalizedId : categoryId;
    setSelectedCategories((prev) => {
      if (prev.includes(safeId)) {
        return prev.filter((id) => id !== safeId);
      }
      return [...prev, safeId];
    });
    setErrors((prev) => ({ ...prev, category: false }));
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!form.description.trim()) {
      nextErrors.description = true;
    }
    if (!selectedCategories.length) {
      nextErrors.category = true;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateCategoryRelations = async () => {
    if (!id) return;
    const postId = Number(id);
    const normalizedSelected = selectedCategories
      .map((value) => Number(value))
      .filter((num) => !Number.isNaN(num));
    const selectedSet = new Set(normalizedSelected);
    const currentRelations = existingRelations.filter((rel) => getRelationCategoryId(rel) !== null);
    const currentRelationMap = new Map();
    currentRelations.forEach((rel) => {
      const catId = getRelationCategoryId(rel);
      if (catId !== null) {
        currentRelationMap.set(catId, rel);
      }
    });

    const deletions = currentRelations.filter((rel) => !selectedSet.has(getRelationCategoryId(rel)));
    for (const rel of deletions) {
      if (!rel?.id) continue;
      await fetch(`${API_URL}/registros-categoria/${rel.id}`, {
        method: "DELETE",
      });
    }

    const additions = [...selectedSet].filter((catId) => !currentRelationMap.has(catId));
    const newRelations = currentRelations.filter((rel) => selectedSet.has(getRelationCategoryId(rel)));

    for (const categoryId of additions) {
      const response = await fetch(`${API_URL}/registros-categoria`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          categoryId,
          background: form.backgroundColor,
        }),
      });
      if (!response.ok) {
        throw new Error("Não foi possível atualizar as categorias do post.");
      }
      const createdRelation = await response.json().catch(() => null);
      newRelations.push(createdRelation || { id: `temp-${categoryId}`, categoryId });
    }

    setExistingRelations(newRelations);
  };

  const handleSave = async () => {
    if (!id || !userId) {
      Alert.alert("Erro", "Não foi possível identificar o usuário ou a postagem.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        description: form.description.trim(),
        ownerPost: form.ownerPost.trim() || user?.name || "",
        backgroundColor: form.backgroundColor,
      };

      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Não foi possível atualizar a postagem.");
      }

      await updateCategoryRelations();

      setSuccessVisible(true);
    } catch (error) {
      Alert.alert("Erro", error.message || "Falha ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#769FCD" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={goBackSafely} disabled={saving}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Editar Postagem</Text>
        <Text style={styles.subtitle}>Atualize os detalhes abaixo</Text>

        <TextInput
          style={styles.input}
          placeholder="Descrição"
          multiline
          value={form.description}
          onChangeText={(v) => updateField("description", v)}
          editable={!saving}
        />

        <TextInput
          style={styles.input}
          placeholder="Autor"
          value={form.ownerPost}
          onChangeText={(v) => updateField("ownerPost", v)}
          editable={!saving}
        />

        <Text style={styles.sectionLabel}>Escolha nova cor de fundo</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.paletteRow}
        >
          {palette.map((color) => {
            const active = form.backgroundColor === color;
            return (
              <TouchableOpacity
                key={color}
                style={[styles.colorSwatch, { backgroundColor: color }, active && styles.colorSwatchActive]}
                onPress={() => updateField("backgroundColor", color)}
                disabled={saving}
              />
            );
          })}
        </ScrollView>

        <Text style={styles.sectionLabel}>Categorias</Text>
        {isFetchingCategories ? (
          <View style={styles.loadingCategories}>
            <ActivityIndicator size="small" color="#3498db" />
            <Text style={styles.loadingText}>Carregando categorias...</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {categories.map((category) => {
              const normalizedId = normalizeCategoryId(category.id);
              const idValue = normalizedId !== null ? normalizedId : category.id;
              const isSelected = selectedCategories.includes(idValue);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    isSelected && styles.selectedCategory,
                    errors.category && styles.inputErrorBorder,
                  ]}
                  onPress={() => toggleCategory(category.id)}
                  disabled={saving}
                >
                  <Text style={isSelected ? styles.selectedCategoryText : styles.categoryText}>
                    {(category.description || category.name || "").toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Salvar alterações</Text>}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={successVisible}
        onRequestClose={() => setSuccessVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tudo certo!</Text>
            <Text style={styles.modalMessage}>As alterações foram salvas com sucesso.</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setSuccessVisible(false);
                goBackSafely();
              }}
            >
              <Text style={styles.modalButtonText}>Voltar ao perfil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 80,
    paddingTop: 40,
  },
  backButton: { alignSelf: "flex-start", marginBottom: 10 },
  backButtonText: { color: "#024C91", fontSize: 16, fontWeight: "600" },
  title: { fontSize: 28, fontWeight: "700", color: "#2E3A59", marginBottom: 6, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#6B6B6B", marginBottom: 20, textAlign: "center" },
  sectionLabel: { fontSize: 16, fontWeight: "600", color: "#2E3A59", marginTop: 10, marginBottom: 12 },
  input: {
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    padding: 14,
    minHeight: 56,
    textAlignVertical: "top",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 16,
  },
  paletteRow: {
    paddingVertical: 10,
  },
  colorSwatch: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 14,
  },
  colorSwatchActive: {
    borderWidth: 3,
    borderColor: "#024C91",
  },
  categoriesRow: {
    paddingVertical: 5,
  },
  categoryButton: {
    backgroundColor: "#FCF8EC",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 30,
    marginRight: 12,
    minWidth: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCategory: {
    backgroundColor: "#3498db",
    borderWidth: 1,
    borderColor: "#3498db",
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
  },
  selectedCategoryText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  loadingCategories: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: "#2E3A59",
  },
  inputErrorBorder: {
    borderColor: "#e74c3c",
    borderWidth: 2,
  },
  saveButton: {
    backgroundColor: "#769FCD",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E3A59",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: "#4A4A4A",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#769FCD",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
