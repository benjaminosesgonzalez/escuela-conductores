import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, Car, LogOut } from 'lucide-react';
import { Layout } from '../components/shared/index.js';
import { colors, spacing } from '../theme/index.js';
import { authService } from '../services/authService.js';

const ProfesorLayout = ({ children, activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const userEmail = currentUser?.email || 'Profesor';

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'alumnos', label: 'Alumnos', icon: Users },
    { id: 'clases', label: 'Mis clases', icon: Calendar },
    { id: 'evaluacion', label: 'Evaluación', icon: Car }
  ];

  return (
    <Layout
      menuItems={menuItems}
      activeTab={activeTab}
      onMenuClick={onTabChange}
      userEmail={userEmail}
      onLogout={handleLogout}
      roleColor={colors.profesor}
      roleIcon={Car}
      title="PROFESOR - ESCUELA"
    >
      {children}
    </Layout>
  );
};

export default ProfesorLayout;
