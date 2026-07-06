import React from 'react';
import { Bell, Menu, X, LogOut } from 'lucide-react';
import { colors, spacing } from '../../theme/index.js';

const Header = ({
  sidebarOpen,
  onToggleSidebar,
  userEmail,
  onLogout,
  title = 'ESCUELA DE CONDUCTORES'
}) => {
<<<<<<< Updated upstream
  const userName = userEmail?.split('@')[0] || 'Usuario';
=======
  // Si userEmail contiene @, es un email, si no, es un nombre
  const userName = userEmail?.includes('@') ? userEmail?.split('@')[0] : (userEmail || 'Usuario');
>>>>>>> Stashed changes
  const userInitial = userEmail?.charAt(0).toUpperCase() || 'U';

  return (
    <header style={{
      backgroundColor: colors.white,
      borderBottom: `1px solid ${colors.border}`,
      padding: `${spacing.padding.medium} ${spacing.padding.xlarge}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Left Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.gap.normal }}>
        <button
          onClick={onToggleSidebar}
          style={{
            padding: spacing.padding.small,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.textPrimary
          }}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: colors.primary,
          margin: 0,
          letterSpacing: '0.5px'
        }}>
          {title}
        </h1>
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.gap.extra }}>
        <button style={{
          padding: spacing.padding.small,
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.textSecondary
        }}>
          <Bell size={24} />
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            backgroundColor: colors.danger,
            borderRadius: spacing.radius.full
          }}></span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.gap.normal,
          paddingLeft: spacing.padding.large,
          borderLeft: `1px solid ${colors.border}`
        }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textPrimary,
              margin: 0
            }}>
              {userName}
            </p>
            <p style={{
              fontSize: '12px',
              color: colors.textTertiary,
              margin: 0
            }}>
              Usuario
            </p>
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: spacing.radius.full,
            backgroundColor: colors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.white,
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            {userInitial}
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            padding: `${spacing.padding.small} ${spacing.padding.medium}`,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: spacing.gap.tight,
            color: colors.textSecondary,
            fontSize: '14px',
            fontWeight: '600',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = colors.danger}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
        >
          <LogOut size={18} />
          Salir
        </button>
      </div>
    </header>
  );
};

export default Header;
