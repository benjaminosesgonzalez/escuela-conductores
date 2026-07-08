import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  BookOpen,
  Award,
  Clock,
  Activity,
  Car,
} from "lucide-react";
import { Layout } from "../components/shared/index.js";
import { colors } from "../theme/index.js";
import { authService } from "../services/authService.js";

const AlumnoLayout = ({ children, activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const userEmail = currentUser?.nombre || currentUser?.email || "Alumno";

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const menuItems = [
    { id: "inicio", label: "Inicio", icon: Home },
    { id: "reservar", label: "Reservar clase", icon: Calendar },
    { id: "misclases", label: "Mis clases", icon: BookOpen },
    { id: "psicotecnico", label: "Sala Psicotécnica", icon: Activity },
    { id: "vehiculos", label: "Solicitar Vehículo", icon: Car },
    { id: "avance", label: "Mi avance", icon: Award },
  ];

  return (
    <Layout
      menuItems={menuItems}
      activeTab={activeTab}
      onMenuClick={onTabChange}
      userEmail={userEmail}
      onLogout={handleLogout}
      roleColor={colors.alumno}
      roleIcon={BookOpen}
      title={`${userEmail.toUpperCase()} - ESCUELA`}
    >
      {children}
    </Layout>
  );
};

export default AlumnoLayout;
