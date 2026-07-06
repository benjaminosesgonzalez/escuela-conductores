export const breakpoints = {
  // Valores en píxeles
  mobile: 375,
  mobileLarge: 640,
  tablet: 768,
  desktop: 1024,
  desktopLarge: 1280,
  desktopXL: 1536,

  // Media queries como strings (para CSS-in-JS)
  queries: {
    mobile: '(max-width: 375px)',
    mobileLarge: '(max-width: 640px)',
    tablet: '(max-width: 768px)',
    desktop: '(max-width: 1024px)',
    desktopLarge: '(max-width: 1280px)',
    desktopXL: '(max-width: 1536px)',

    // Queries de "mínimo"
    mobileUp: '(min-width: 376px)',
    tabletUp: '(min-width: 769px)',
    desktopUp: '(min-width: 1025px)',
    desktopLargeUp: '(min-width: 1281px)',
  },

  // Utilidades para detectar tamaño en JavaScript
  isMobile: (width) => width <= 640,
  isTablet: (width) => width > 640 && width <= 1024,
  isDesktop: (width) => width > 1024,
};
