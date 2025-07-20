/**
 * 🎨 StraySafe Design Tokens - 2025 Style Guide
 * Based on exaggerated minimalism, glassmorphism, and modern UI trends
 */

export const Colors = {
  // Primary Brand Colors (Soft Blues + Neutrals)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main brand color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Neutral Colors
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Soft Dark Mode (Low-Light) Colors
  dark: {
    background: '#0a0f1c',
    surface: '#111827',
    card: '#1f2937',
    border: '#374151',
    text: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      muted: '#9ca3af',
    }
  },

  // Status Colors
  status: {
    available: '#10b981',
    fostered: '#3b82f6',
    adopted: '#8b5cf6',
    injured: '#ef4444',
    missing: '#f59e0b',
    hidden: '#6b7280',
    deceased: '#374151',
  },

  // Glassmorphism Effects
  glass: {
    white: 'rgba(255, 255, 255, 0.1)',
    whiteStrong: 'rgba(255, 255, 255, 0.2)',
    dark: 'rgba(0, 0, 0, 0.1)',
    darkStrong: 'rgba(0, 0, 0, 0.2)',
  }
};

export const Typography = {
  // Exaggerated Minimalism - Large, Bold Typography
  display: {
    large: {
      fontSize: 40,
      fontWeight: '800' as const,
      lineHeight: 48,
      letterSpacing: -1,
    },
    medium: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    small: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
      letterSpacing: -0.25,
    }
  },

  heading: {
    h1: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 32,
    },
    h2: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    h3: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 26,
    }
  },

  body: {
    large: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    medium: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    }
  },

  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  }
};

export const Spacing = {
  // Exaggerated spacing for minimalism
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  
  // Specialized spacing
  gutter: 20, // Standard screen padding
  cardGap: 16, // Gap between cards in bento grid
  sectionGap: 32, // Gap between major sections
};

export const BorderRadius = {
  // Soft Edges & Rounded UI
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 9999, // For pill-shaped buttons
  circle: 50, // For circular elements (%)
};

export const Shadows = {
  // Neumorphism & Depth Effects
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },

  // Colored shadows for brand elements
  brand: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },

  // Inner shadows for neumorphic elements
  inset: {
    // Note: React Native doesn't support inset shadows
    // This will be implemented using gradients and borders
  }
};

export const Glassmorphism = {
  // Translucent glass-like effects
  light: {
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: Colors.glass.whiteStrong,
    backdropFilter: 'blur(10px)', // Note: Not supported in React Native
  },
  
  dark: {
    backgroundColor: Colors.glass.dark,
    borderWidth: 1,
    borderColor: Colors.glass.darkStrong,
    backdropFilter: 'blur(10px)', // Note: Not supported in React Native
  }
};

export const Animation = {
  // Micro-interactions timing
  timing: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  
  // Easing curves
  easing: {
    ease: 'ease' as const,
    easeIn: 'ease-in' as const,
    easeOut: 'ease-out' as const,
    easeInOut: 'ease-in-out' as const,
  }
};

export const Layout = {
  // Bento Grid System
  bentoGrid: {
    columns: 2,
    gap: Spacing.cardGap,
    aspectRatios: {
      square: 1,
      wide: 1.5,
      tall: 0.75,
    }
  },
  
  // Container sizes
  container: {
    maxWidth: 480, // Mobile-first max width
    padding: Spacing.gutter,
  }
};