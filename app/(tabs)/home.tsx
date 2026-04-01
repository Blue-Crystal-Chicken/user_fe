import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import Hero from '@/components/hero';
import { BestSellingProducts } from '@/components/best_selling_products';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View>
      <Hero title={"Blue Crystal Chicken"} subtitle={"Your favorite fast food ordering app!"}/>
      <View className="flex p-4 my-5 gap-4 border-b border-zinc-800">
        <View className="flex flex-row justify-between">
          <Text className="text-white font-semibold text-lg">Best-selling products </Text>
          <TouchableOpacity onPress={() => router.push('/products')}>
            <Text className="text-blue-500 font-semibold text-lg">See all</Text>
          </TouchableOpacity>
        </View>
          <BestSellingProducts/>
      </View>
    </View>
  );
}
