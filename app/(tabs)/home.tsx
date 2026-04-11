import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import Hero from '@/components/hero';
import { BestSellingProducts } from '@/components/best_selling_products';
import { router } from 'expo-router';
import { Menus } from '@/components/menus';



export default function HomeScreen() {
  return (


    <ScrollView>
  <Hero title="Blue Crystal Chicken" subtitle="Your favorite fast food ordering app!" />

  <View className="flex p-4 gap-6">

    <View className="gap-3">
      <Text className="text-white font-semibold text-lg">Menu</Text>
      <Menus />
    </View>

    <View className="gap-3 border-t border-zinc-800 pt-5">
      <View className="flex-row justify-between items-center">
        <Text className="text-white font-semibold text-lg">Best-selling products</Text>
        <TouchableOpacity onPress={() => router.push('/products')}>
          <Text className="text-blue-500 text-sm">See all</Text>
        </TouchableOpacity>
      </View>
      <BestSellingProducts />
    </View>

    <View className="gap-3 border-t border-zinc-800 pt-5">
      <View className="flex-row justify-between items-center">
        <Text className="text-white font-semibold text-lg">Offers</Text>
        <TouchableOpacity onPress={() => router.push('/offers')}>
          <Text className="text-blue-500 text-sm">See all</Text>
        </TouchableOpacity>
      </View>
    </View>

  </View>
</ScrollView>
  );
}
