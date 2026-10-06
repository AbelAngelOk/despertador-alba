import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

type FeatherIconName = keyof typeof Feather.glyphMap;

function TabIcon({
  name,
  focused,
  activeColor,
  inactiveColor,
}: {
  name: FeatherIconName;
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
}) {
  return <Feather name={name} size={22} color={focused ? activeColor : inactiveColor} />;
}

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="home"
              focused={focused}
              activeColor={theme.colors.primary}
              inactiveColor={theme.colors.textSecondary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="despertadores"
        options={{
          title: 'Despertadores',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="sunrise"
              focused={focused}
              activeColor={theme.colors.primary}
              inactiveColor={theme.colors.textSecondary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="seguimiento"
        options={{
          title: 'Seguimiento',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="trending-up"
              focused={focused}
              activeColor={theme.colors.primary}
              inactiveColor={theme.colors.textSecondary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="recursos"
        options={{
          title: 'Recursos',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="book-open"
              focused={focused}
              activeColor={theme.colors.primary}
              inactiveColor={theme.colors.textSecondary}
            />
          ),
        }}
      />
    </Tabs>
  );
}
