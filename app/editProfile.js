import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, signIn } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    avatarUrl: "",
    bio: "",
    password: "",
    confirmPassword: "",
  });

  const [successVisible, setSuccessVisible] = useState(false);

  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setForm({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      avatarUrl: user.avatarUrl || "",
      bio: user.bio || "",
      password: "",
      confirmPassword: "",
    });

    setLoading(false);
  }, [user]);

  const validate = () => {
    const { name, username, email, avatarUrl, bio, password, confirmPassword } = form;

    if (!name.trim() || !username.trim() || !email.trim() || !avatarUrl.trim() || !bio.trim()) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return false;
    }

    if (password && password.length < 6) {
      Alert.alert("Erro", "A nova senha deve ter pelo menos 6 caracteres.");
      return false;
    }

    if (password && password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert("Erro", "Email inválido.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    if (!user) {
      Alert.alert("Erro", "Usuário não encontrado.");
      return;
    }

    const { name, username, email, avatarUrl, bio, password } = form;

    const updatedUser = {
      ...user,
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      avatarUrl: avatarUrl.trim(),
      bio: bio.trim(),
      ...(password ? { password } : {}),
    };

    setSaving(true);

    try {
      const result = await signIn(updatedUser);

      if (!result.success) {
        throw new Error(result.message || "Falha ao atualizar perfil.");
      }

      setSuccessVisible(true);
    } catch (error) {
      Alert.alert("Erro", error.message || "Não foi possível atualizar o perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessVisible(false);
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#769FCD" />
      </View>
    );
  }

  const avatar = form.avatarUrl.trim();
  const profileImageSource = /^https?:\/\//.test(avatar)
    ? { uri: avatar }
    : require("../assets/profile.png");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={saving}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>

          <View style={styles.profilePictureContainer}>
            <Image source={profileImageSource} style={styles.profilePicture} />
            <Text style={styles.profilePictureText}>Atualize sua foto de perfil</Text>
          </View>

          <Text style={styles.title}>Editar Perfil</Text>
          <Text style={styles.subtitle}>Atualize seus dados abaixo</Text>

          {[
            { key: "name", placeholder: "Nome completo" },
            { key: "username", placeholder: "Nome de usuário" },
            {
              key: "email",
              placeholder: "Email",
              keyboardType: "email-address",
              autoCorrect: false,
            },
            { key: "avatarUrl", placeholder: "URL do Avatar" },
            { key: "bio", placeholder: "Bio" },
          ].map((item) => (
            <TextInput
              key={item.key}
              style={styles.input}
              placeholder={item.placeholder}
              value={form[item.key]}
              onChangeText={(t) => updateField(item.key, t)}
              autoCapitalize="none"
              keyboardType={item.keyboardType}
              autoCorrect={item.autoCorrect}
              editable={!saving}
            />
          ))}

          <TextInput
            style={styles.input}
            placeholder="Nova senha (opcional)"
            value={form.password}
            onChangeText={(v) => updateField("password", v)}
            secureTextEntry
            autoCapitalize="none"
            editable={!saving}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmar nova senha"
            value={form.confirmPassword}
            onChangeText={(v) => updateField("confirmPassword", v)}
            secureTextEntry
            autoCapitalize="none"
            editable={!saving}
          />

          <TouchableOpacity
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Salvar alterações</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal transparent animationType="fade" visible={successVisible} onRequestClose={handleCloseSuccess}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tudo certo!</Text>
            <Text style={styles.modalMessage}>Suas alterações foram salvas.</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleCloseSuccess}>
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
  backButton: { alignSelf: "flex-start", marginBottom: 10 },
  backButtonText: { color: "#024C91", fontSize: 16, fontWeight: "bold" },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, justifyContent: "center", padding: 20, paddingTop: 60, paddingBottom: 40 },
  profilePictureContainer: { justifyContent: "center", alignItems: "center", marginBottom: 20 },
  profilePicture: { width: 150, height: 150, borderRadius: 100, backgroundColor: "#D9D9D9", marginBottom: 5 },
  profilePictureText: { color: "#656565", fontSize: 16, textAlign: "center" },
  title: { fontSize: 32, fontWeight: "bold", color: "#333", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 40, textAlign: "center" },
  input: {
    backgroundColor: "#D9D9D9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#656565",
  },
  button: {
    backgroundColor: "#769FCD",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    minHeight: 50,
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
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
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#2E3A59", marginBottom: 8, textAlign: "center" },
  modalMessage: { fontSize: 16, color: "#4A4A4A", textAlign: "center", marginBottom: 20 },
  modalButton: { backgroundColor: "#769FCD", borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24 },
  modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});