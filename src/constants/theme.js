/**
 * theme.js
 * Centralised design tokens for the app.
 */

export const COLORS = {
  primary: '#1a73e8',
  primaryDark: '#1557b0',
  primaryLight: '#e8f0fe',
  secondary: '#34a853',
  secondaryLight: '#e6f4ea',
  accent: '#fbbc04',
  danger: '#e53935',
  dangerLight: '#fdecea',
  warning: '#fb8c00',
  warningLight: '#fff3e0',
  success: '#43a047',
  successLight: '#e8f5e9',
  white: '#ffffff',
  black: '#000000',
  background: '#f5f7fa',
  surface: '#ffffff',
  border: '#e0e0e0',
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#bdbdbd',
  shadow: 'rgba(0,0,0,0.08)',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 999,
};

export const SHADOW = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
};

export const CATEGORIES = [
  'Food',
  'Transportation',
  'Housing',
  'Entertainment',
  'Healthcare',
  'Education',
  'Shopping',
  'Utilities',
  'Other',
];

export const CATEGORY_COLORS = {
  Food: '#e53935',
  Transportation: '#1a73e8',
  Housing: '#fb8c00',
  Entertainment: '#9c27b0',
  Healthcare: '#00897b',
  Education: '#3949ab',
  Shopping: '#e91e63',
  Utilities: '#546e7a',
  Other: '#78909c',
};
