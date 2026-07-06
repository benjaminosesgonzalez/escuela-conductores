import React from 'react';
import { colors, spacing } from '../../theme/index.js';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon: Icon,
  fullWidth = false,
  style = {}
}) => {
  // Variantes de colores
  const variants = {
    primary: {
      bg: colors.primary,
      bgHover: colors.primaryLight,
      text: colors.white,
      border: 'none'
    },
    success: {
      bg: colors.success,
      bgHover: colors.successLight,
      text: colors.white,
      border: 'none'
    },
    danger: {
      bg: colors.danger,
      bgHover: colors.dangerLight,
      text: colors.white,
      border: 'none'
    },
    warning: {
      bg: colors.warning,
      bgHover: colors.warningLight,
      text: colors.white,
      border: 'none'
    },
    secondary: {
      bg: colors.borderLight,
      bgHover: colors.border,
      text: colors.textPrimary,
      border: 'none'
    },
    ghost: {
      bg: 'transparent',
      bgHover: colors.background,
      text: colors.textPrimary,
      border: `1px solid ${colors.border}`
    }
  };

  // Tamaños
  const sizes = {
    sm: {
<<<<<<< Updated upstream
      padding: `${spacing.padding.small} ${spacing.padding.md}`,
      fontSize: '13px'
    },
    md: {
      padding: `${spacing.padding.md} ${spacing.padding.lg}`,
      fontSize: '14px'
    },
    lg: {
      padding: `${spacing.padding.lg} ${spacing.padding.xl}`,
      fontSize: '15px'
=======
      padding: `${spacing.padding.md} ${spacing.padding.lg}`,
      fontSize: '20px'
    },
    md: {
      padding: `${spacing.padding.lg} ${spacing.padding.xl}`,
      fontSize: '20px'
    },
    lg: {
      padding: `${spacing.padding.xlarge} ${spacing.padding.xl}`,
      fontSize: '20px'
>>>>>>> Stashed changes
    }
  };

  const variant_style = variants[variant] || variants.primary;
  const size_style = sizes[size] || sizes.md;

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.gap.tight,
        padding: size_style.padding,
        fontSize: size_style.fontSize,
        fontWeight: '600',
        backgroundColor: disabled ? colors.disabled : (isHovered ? variant_style.bgHover : variant_style.bg),
        color: variant_style.text,
        border: variant_style.border,
        borderRadius: spacing.radius.md,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.6 : 1,
        ...style
      }}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export default Button;
