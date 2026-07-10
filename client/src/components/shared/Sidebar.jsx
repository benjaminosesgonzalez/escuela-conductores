import React from 'react';
import { colors, spacing } from '../../theme/index.js';

const Sidebar = ({
  isOpen,
  menuItems,
  activeTab,
  onMenuClick,
  roleColor = colors.primary,
  roleIcon: RoleIcon
}) => {
  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: isOpen ? '340px' : '80px',
      backgroundColor: roleColor,
      color: colors.white,
      transition: 'width 0.3s ease',
      overflowY: 'auto',
      zIndex: 50,
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    }}>
      {/* Header Sidebar */}
      <div style={{
        padding: spacing.padding.xlarge,
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: spacing.gap.normal
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: spacing.radius.md,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {RoleIcon && <RoleIcon size={24} />}
        </div>
        {isOpen && (
          <span style={{
            fontSize: '20px',
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }}>
            MENÚ
          </span>
        )}
      </div>

      {/* Menu Items */}
      <nav style={{
        padding: spacing.padding.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.gap.tight,
        marginTop: spacing.margin.large
      }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onMenuClick(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.gap.normal,
                padding: `${spacing.padding.small} ${spacing.padding.lg}`,
                borderRadius: spacing.radius.lg,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? colors.white : 'transparent',
                color: isActive ? roleColor : 'rgba(255,255,255,0.8)',
                fontWeight: isActive ? '600' : '500',
                fontSize: '24px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon size={20} />
              {isOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
