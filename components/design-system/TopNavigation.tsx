import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { 
  TopNavigation as KittenTopNavigation, 
  TopNavigationAction,
  useTheme 
} from '@ui-kitten/components';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

interface TopNavigationProps {
  title: string;
  onBackPress?: () => void;
  accessoryRight?: () => React.ReactElement;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  title,
  onBackPress,
  accessoryRight,
}) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const BackAction = () => (
    <TopNavigationAction
      icon={() => (
        <IconSymbol 
          size={24} 
          name="chevron.backward" 
          color={theme['color-basic-600']} 
        />
      )}
      onPress={onBackPress}
    />
  );

  return (
    <KittenTopNavigation
      title={title}
      alignment="center"
      accessoryLeft={onBackPress ? BackAction : undefined}
      accessoryRight={accessoryRight}
      style={[
        styles.topNavigation,
        {
          backgroundColor: colorScheme === 'dark' 
            ? 'rgba(28, 28, 30, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          borderBottomColor: colorScheme === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.1)',
        }
      ]}
    />
  );
};

const styles = StyleSheet.create({
  topNavigation: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    borderBottomWidth: 0.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});
