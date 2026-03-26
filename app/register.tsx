import Register from '@/components/register';
import { Stack, router } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

export default function RegisterScreen() {
  return (
    <View className="flex-1 items-center justify-center p-4 bg-background">
      <Stack.Screen 
        options={{ 
          title: 'Register',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace('/')} className="mr-4">
              <Icon as={ArrowLeft} size={24} />
            </TouchableOpacity>
          )
        }} 
      />
      <Register />
    </View>
  );
}
