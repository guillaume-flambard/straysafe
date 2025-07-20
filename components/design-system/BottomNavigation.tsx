import React from 'react';
import { 
  BottomNavigation as KittenBottomNavigation, 
  BottomNavigationTab,
  Text,
  useTheme
} from '@ui-kitten/components';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';

interface BottomNavigationProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
  isAdmin?: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  selectedIndex,
  onSelect,
  isAdmin = false,
}) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const tabs = [
    {
      title: 'Dogs',
      icon: 'heart.fill',
    },
    {
      title: 'Calendar',
      icon: 'calendar',
    },
    ...(isAdmin ? [{
      title: 'Users',
      icon: 'person.2.fill',
    }] : []),
    {
      title: 'Settings',
      icon: 'gear',
    },
  ];

  const renderTab = (title: string, iconName: string) => (
    <BottomNavigationTab
      title={<Text category="c2" style={styles.tabTitle}>{title}</Text>}
      icon={(props) => (
        <IconSymbol 
          size={24} 
          name={iconName} 
          color={props.style?.tintColor || theme['color-primary-500']} 
        />
      )}
    />
  );

  return (
    <KittenBottomNavigation
      selectedIndex={selectedIndex}
      onSelect={onSelect}
      style={[
        styles.bottomNavigation,
        {
          backgroundColor: colorScheme === 'dark' 
            ? 'rgba(28, 28, 30, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
        }
      ]}
      indicatorStyle={styles.indicator}
    >
      {tabs.map((tab, index) => 
        renderTab(tab.title, tab.icon)
      )}
    </KittenBottomNavigation>
  );
};

const styles = StyleSheet.create({
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  indicator: {
    backgroundColor: 'transparent',
  },
});