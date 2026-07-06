import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "./user.service.js";

export async function loginUser(email, password) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Credenciales incorrectas");
  }// src/services/authService.js

const API_URL = "http://localhost:5000/api";

export const authService = {
  // 🔴 CAMBIO 1: Adaptado para recibir { success, token, user } del backend
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // 🔴 CAMBIO 2: Verificar data.success en lugar de response.ok
      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || "Login fallido" };
      }
    } catch (err) {
      console.error("Error en login:", err);
      return { success: false, error: "Error de conexión con el servidor" };
    }
  },

  // 🔴 CAMBIO 3: Obtener usuario actual del localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // 🔴 CAMBIO 4: Obtener token almacenado
  getToken: () => {
    return localStorage.getItem("token");
  },

  // 🔴 CAMBIO 5: Verificar autenticación
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // 🔴 CAMBIO 6: Obtener rol del usuario (importante para rutas protegidas)
  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user?.rol || null;
  },

  // 🔴 CAMBIO 7: Logout - elimina token y datos
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};


  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Credenciales incorrectas");
  }

  const payload = {
    sub: user.id,
    email: user.email,

    rol: user.rol,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  delete user.password;
  return { user, token };
}
