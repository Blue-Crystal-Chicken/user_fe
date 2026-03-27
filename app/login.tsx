import { Login } from '@/components/login';
import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function LoginScreen() {
  return (
    <View className="flex-1 items-center justify-center p-4 bg-background">
      <Stack.Screen options={{ title: 'Login' }} />
      <Login />
    </View>
  );
}
