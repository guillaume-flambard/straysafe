import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme() {
  const colorScheme = useRNColorScheme();
  // Return 'light' as default if colorScheme is null
  return colorScheme ?? 'light';
}
