import React, { useState } from "react";
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
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email, password);

      if (!result.success) {
        Alert.alert("Erro", result.message || "Falha ao fazer login");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {/* Placeholder for logo */}
        </View>
        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Não possui um login? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity disabled={loading}>
              <Text style={styles.registerLink}>Fazer cadastro</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <Text style={styles.infoText}>
          💡 Dica: Se não tiver conta, crie uma nova!
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Alterado para fundo branco
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    height: 60, // Altura para o espaço da logo
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    // Você pode colocar aqui o estilo adicional para a logo
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#D9D9D9", // Fundo das caixas de texto
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#000", // Cor do texto
  },
  button: {
    backgroundColor: "#769FCD", // Fundo do botão
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    minHeight: 50,
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff", // Cor do texto do botão
    fontSize: 16,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    color: "#666", // Cor do texto do registro
    fontSize: 14,
  },
  registerLink: {
    color: "#024C91", // Cor do link para cadastro
    fontSize: 14,
    fontWeight: "bold",
  },
  infoText: {
    marginTop: 30,
    textAlign: "center",
    color: "#888",
    fontSize: 14,
    paddingHorizontal: 20,
  },
});
