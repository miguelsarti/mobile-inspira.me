import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function EditProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [password, setPassword] = useState("");

  // Buscar dados do usuário ao entrar
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const userParsed = JSON.parse(storedUser);

          setName(userParsed.name || "");
          setUsername(userParsed.username || "");
          setEmail(userParsed.email || "");
          setBio(userParsed.bio || "");
          setAvatarUrl(userParsed.avatarUrl || "");
        }
      } catch (err) {
        console.log("Erro ao carregar usuário:", err);
      }
      setLoading(false);
    };

    loadUserData();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Erro", "Você não está autenticado.");
        return;
      }

      const dataToUpdate = {
        name,
        username,
        email,
        bio,
        avatarUrl,
      };

      // Enviar senha apenas se preenchida
      if (password.trim().length > 0) {
        dataToUpdate.password = password;
      }

      const response = await axios.put(
        "http://SEU_IP:3000/update-profile",
        dataToUpdate,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Atualiza o user no AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

      Alert.alert("Sucesso!", "Perfil atualizado com sucesso!");

      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível atualizar o perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Seu nome"
      />

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="@username"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        placeholder="email@example.com"
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={bio}
        onChangeText={setBio}
        multiline
      />

      <Text style={styles.label}>Avatar URL</Text>
      <TextInput
        style={styles.input}
        value={avatarUrl}
        onChangeText={setAvatarUrl}
        placeholder="URL da imagem"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Nova Senha (opcional)</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Digite para trocar"
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.saveText}>Salvar alterações</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  title: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 10,
  },
  label: {
    color: "#CCC",
    marginTop: 10,
    marginBottom: 5,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#FFF",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#4A9EFF",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 25,
    alignItems: "center",
  },
  saveText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
