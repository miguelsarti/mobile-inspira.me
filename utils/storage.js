import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  USER: "@rotas_privadas:user",
  USERS_DB: "@rotas_privadas:users_db",
};

export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return true;
  } catch (error) {
    console.error("Erro ao salvar usuário:", error);
    return false;
  }
};

export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Erro ao obter usuário:", error);
    return null;
  }
};

export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    return true;
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    return false;
  }
};

export const getAllUsers = async () => {
  try {
    const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error("Erro ao obter usuários:", error);
    return [];
  }
};

export const saveNewUser = async (user) => {
  try {
    const users = await getAllUsers();
    const emailExists = users.some((u) => u.email === user.email);
    if (emailExists) {
      return { success: false, message: "Email já cadastrado" };
    }
    users.push(user);
    await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar novo usuário:", error);
    return { success: false, message: "Erro ao cadastrar usuário" };
  }
};

export const validateLogin = async (email, password) => {
  try {
    const users = await getAllUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword };
    }

    return { success: false, message: "Email ou senha inválidos" };
  } catch (error) {
    console.error("Erro ao validar login:", error);
    return { success: false, message: "Erro ao fazer login" };
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.USERS_DB]);
    return true;
  } catch (error) {
    console.error("Erro ao limpar dados:", error);
    return false;
  }
};
