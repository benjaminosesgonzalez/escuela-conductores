import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, FileText, Settings } from 'lucide-react';
import { Layout } from '../components/shared/index.js';
import { colors } from '../theme/index.js';
import { authService } from '../services/authService.js';

const SecretariaLayout = ({ children, activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const userEmail = currentUser?.email || 'Secretaria';

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'alumnos', label: 'Gestión Alumnos', icon: Users },
    { id: 'reportes', label: 'Reportes', icon: FileText },
    { id: 'configuracion', label: 'Configuración', icon: Settings }
  ];

  return (
    <Layout
      menuItems={menuItems}
      activeTab={activeTab}
      onMenuClick={onTabChange}
      userEmail={userEmail}
      onLogout={handleLogout}
      roleColor={colors.secretaria}
      roleIcon={FileText}
      title="SECRETARIA - ESCUELA"
    >
      {children}
    </Layout>
  );
};

export default SecretariaLayout;
