import { light, dark } from '@eva-design/eva';

// Custom theme extending Eva Design
export const customLightTheme = {
  ...light,
  'color-primary-100': '#E3F2FD',
  'color-primary-200': '#BBDEFB', 
  'color-primary-300': '#90CAF9',
  'color-primary-400': '#64B5F6',
  'color-primary-500': '#2196F3', // Main brand color
  'color-primary-600': '#1E88E5',
  'color-primary-700': '#1976D2',
  'color-primary-800': '#1565C0',
  'color-primary-900': '#0D47A1',
  
  'color-success-100': '#E8F5E8',
  'color-success-200': '#C8E6C9',
  'color-success-300': '#A5D6A7',
  'color-success-400': '#81C784',
  'color-success-500': '#4CAF50',
  'color-success-600': '#43A047',
  'color-success-700': '#388E3C',
  'color-success-800': '#2E7D32',
  'color-success-900': '#1B5E20',

  'color-warning-100': '#FFF3E0',
  'color-warning-200': '#FFE0B2',
  'color-warning-300': '#FFCC02',
  'color-warning-400': '#FFB74D',
  'color-warning-500': '#FF9800',
  'color-warning-600': '#FB8C00',
  'color-warning-700': '#F57C00',
  'color-warning-800': '#EF6C00',
  'color-warning-900': '#E65100',

  'color-danger-100': '#FFEBEE',
  'color-danger-200': '#FFCDD2',
  'color-danger-300': '#EF9A9A',
  'color-danger-400': '#E57373',
  'color-danger-500': '#F44336',
  'color-danger-600': '#E53935',
  'color-danger-700': '#D32F2F',
  'color-danger-800': '#C62828',
  'color-danger-900': '#B71C1C',

  // Background colors for glassmorphism effect
  'color-basic-100': '#FFFFFF',
  'color-basic-200': '#F7F9FC',
  'color-basic-300': '#EDF1F7',
  'color-basic-400': '#E4E9F2',
  'color-basic-500': '#C5CEE0',
  'color-basic-600': '#8F9BB3',
  'color-basic-700': '#2E3A59',
  'color-basic-800': '#222B45',
  'color-basic-900': '#192038',
  'color-basic-1000': '#151A30',
  'color-basic-1100': '#101426',

  // Custom glassmorphism styles
  'background-basic-color-1': 'rgba(255, 255, 255, 0.85)',
  'background-basic-color-2': 'rgba(247, 249, 252, 0.9)',
  'border-basic-color-1': 'rgba(196, 201, 216, 0.2)',
  'border-basic-color-2': 'rgba(143, 155, 179, 0.3)',
};

export const customDarkTheme = {
  ...dark,
  'color-primary-100': '#E3F2FD',
  'color-primary-200': '#BBDEFB',
  'color-primary-300': '#90CAF9', 
  'color-primary-400': '#64B5F6',
  'color-primary-500': '#2196F3',
  'color-primary-600': '#1E88E5',
  'color-primary-700': '#1976D2',
  'color-primary-800': '#1565C0',
  'color-primary-900': '#0D47A1',

  // Dark theme glassmorphism backgrounds
  'background-basic-color-1': 'rgba(28, 28, 30, 0.85)',
  'background-basic-color-2': 'rgba(44, 44, 46, 0.9)',
  'border-basic-color-1': 'rgba(255, 255, 255, 0.1)',
  'border-basic-color-2': 'rgba(255, 255, 255, 0.15)',
};

export const mapping = {
  strict: {
    'text-font-family': 'System',
  },
};