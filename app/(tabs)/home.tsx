import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Text className="text-foreground text-3xl font-bold text-center">
        Welcome to Blue Crystal Chicken
      </Text>
      <Text className="text-muted-foreground mt-4 text-center">
        Your favorite fast food ordering app!
      </Text>
    </View>
  );
}
