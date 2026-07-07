import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, Car, LogOut, FolderOpen, Video } from 'lucide-react';
import { Layout } from '../components/shared/index.js';
import { colors, spacing } from '../theme/index.js';
import { authService } from '../services/authService.js';

const ProfesorLayout = ({ children, activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const userEmail = currentUser?.nombre || currentUser?.email || 'Profesor';

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'disponibilidad', label: 'Disponibilidad', icon: Calendar },
    { id: 'misclases', label: 'Mis clases', icon: Car },
    { id: 'clasesOnline', label: 'Clases Online', icon: Video },
    { id: 'repositorio', label: 'Repositorio', icon: FolderOpen }
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
      title={`${userEmail.toUpperCase()} - ESCUELA`}
    >
      {children}
    </Layout>
  );
};

export default ProfesorLayout;
