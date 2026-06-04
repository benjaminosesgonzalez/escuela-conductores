// src/components/ProtectedRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { authService } from "../services/authService";

/**
 * 🔴 NUEVO COMPONENTE: ProtectedRoute
 * 
 * Propósito: Validar que el usuario:
 * 1. Esté autenticado (tenga token)
 * 2. Tenga el rol permitido para acceder a la página
 * 
 * Uso:
 * <ProtectedRoute allowedRoles={["profesor"]}>
 *   <EscuelaDeConuctoresProfesor />
 * </ProtectedRoute>
 */

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // 🔴 CAMBIO 1: Verificar si el usuario tiene token válido
  const isAuthenticated = authService.isAuthenticated();
  
  // 🔴 CAMBIO 2: Obtener rol actual del usuario
  const userRole = authService.getUserRole();

  // 🔴 CAMBIO 3: Si no está autenticado, redirige a login
  if (!isAuthenticated) {
    console.warn("⚠️ Usuario no autenticado - redirigiendo a /login");
    return <Navigate to="/login" replace />;
  }

  // 🔴 CAMBIO 4: Validar que el rol esté en la lista permitida
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.warn(`⚠️ Rol "${userRole}" no permitido. Redirigiendo...`);
    
    // 🔴 CAMBIO 5: Redirigir según el rol del usuario
    if (userRole === "administracion") {
      return <Navigate to="/dashboard" replace />;
    } else if (userRole === "profesor") {
      return <Navigate to="/escuela-profesor" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // 🔴 CAMBIO 6: Si pasa todas las validaciones, mostrar el componente
  return children;
};

export default ProtectedRoute;
