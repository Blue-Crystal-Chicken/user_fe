import { Text, View } from 'react-native';
import { Stack } from 'expo-router';

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Stack.Screen options={{ title: 'Home', headerLeft: () => null }} />
      <Text className="text-foreground text-2xl font-bold">Welcome Home!</Text>
      <Text className="text-muted-foreground mt-2">Registration successful.</Text>
    </View>
  );
}
