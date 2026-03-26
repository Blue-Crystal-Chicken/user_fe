import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export default function OffersScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Text className="text-foreground text-2xl font-bold">Special Offers</Text>
      <Text className="text-muted-foreground mt-2">Check back soon for latest deals!</Text>
    </View>
  );
}
