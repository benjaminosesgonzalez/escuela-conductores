import React from 'react';
import { colors, spacing } from '../../theme/index.js';

const Card = ({
  children,
  title,
  icon: Icon,
  shadow = true,
  padding = spacing.padding.xlarge,
  onClick,
  hoverable = false,
  style = {}
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: colors.white,
        borderRadius: spacing.radius.lg,
        boxShadow: shadow ? (isHovered && hoverable ? '0 8px 24px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.08)') : 'none',
        padding,
        cursor: hoverable ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        border: `1px solid ${colors.borderLight}`,
        transform: hoverable && isHovered ? 'translateY(-4px)' : 'translateY(0)',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Header si hay título o icono */}
      {(title || Icon) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.gap.normal,
          marginBottom: spacing.margin.large,
          paddingBottom: spacing.padding.lg,
          borderBottom: `1px solid ${colors.borderLight}`
        }}>
          {Icon && (
            <Icon size={24} color={colors.primary} />
          )}
          {title && (
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              margin: 0
            }}>
              {title}
            </h3>
          )}
        </div>
      )}

      {/* Content */}
      <div>
        {children}
      </div>
    </div>
  );
};

export default Card;
