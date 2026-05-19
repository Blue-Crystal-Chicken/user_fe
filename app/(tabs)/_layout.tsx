import { Tabs } from 'expo-router';
import { HomeIcon, TagIcon, PackageIcon, MoreHorizontalIcon, SquareMenu } from 'lucide-react-native';
import { NAV_THEME } from '@/lib/theme';

export default function TabsLayout() {
  
  const theme = NAV_THEME.dark;   

  return (
    <Tabs
      screenOptions={{
        // Tab Bar (in basso)
        tabBarActiveTintColor: '#4cc9f0',           
        tabBarInactiveTintColor: '#8ab4e0',         
        tabBarStyle: {
          backgroundColor: '#0a0f1c',               
          borderTopColor: '#1e2f5a',                
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },

        // Header (in alto)
        headerStyle: {
          backgroundColor: '#0a0f1c',               
          elevation: 0,                             
          shadowOpacity: 0,                         
        },
        headerTintColor: '#e0f0ff',                 
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '600',
          color: '#ffffff',
        },
        headerShadowVisible: false,                 
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,                       
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="menu"           
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => <SquareMenu color={color} size={size} />,
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
          headerTitle: 'Tutti i Prodotti',  
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