import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { Colors } from '@/constants/theme';

type FeatherIconName = keyof typeof Feather.glyphMap;

function TabIcon({ name, focused }: { name: FeatherIconName; focused: boolean }) {
  return <Feather name={name} size={22} color={focused ? Colors.accent : Colors.textSecondary} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.backgroundElement,
          borderTopColor: Colors.border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="despertadores"
        options={{
          title: 'Despertadores',
          tabBarIcon: ({ focused }) => <TabIcon name="sunrise" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="seguimiento"
        options={{
          title: 'Seguimiento',
          tabBarIcon: ({ focused }) => <TabIcon name="trending-up" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notificaciones"
        options={{
          title: 'Notificaciones',
          tabBarIcon: ({ focused }) => <TabIcon name="bell" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon name="user" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
