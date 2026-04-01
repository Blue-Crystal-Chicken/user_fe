import { Tabs } from 'expo-router';
import { HomeIcon, TagIcon, PackageIcon, MoreHorizontalIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const theme = NAV_THEME[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: 'Offerte',
          tabBarIcon: ({ color, size }) => <TagIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Prodotti',
          tabBarIcon: ({ color, size }) => <PackageIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="other"
        options={{
          title: 'Altro',
          tabBarIcon: ({ color, size }) => <MoreHorizontalIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
