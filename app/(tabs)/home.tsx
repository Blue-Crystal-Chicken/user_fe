import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import Hero from '@/components/hero';
import { BestSellingProducts } from '@/components/best_selling_products';
import { router } from 'expo-router';
import { Menus } from '@/components/menus';
import { Offers } from '@/components/offers';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#0a0f1c]" edges={['top']}>
      <ScrollView className="flex-1">
        <Hero title="Blue Crystal Chicken" subtitle="Your favorite fast food ordering app!" />

      <View className="flex p-5 gap-8">

        {/* Sezione Menu */}
<View className="gap-4">
  <View className="flex-row justify-between items-center">
    <Text className="text-white font-semibold text-[21px] tracking-[-0.3px]">
      Menu
    </Text>
    
    <TouchableOpacity onPress={() => router.push('/menu')}>
      <Text className="text-[#4cc9f0] text-sm font-medium">
        See all →
      </Text>
    </TouchableOpacity>
  </View>
  
  <Menus />
</View>

        {/* Sezione Best-selling */}
        <View className="gap-4 border-t border-[#1e2f5a] pt-6">
          <View className="flex-row justify-between items-center">
            <Text className="text-white font-semibold text-[21px] tracking-[-0.3px]">
              Best-selling products
            </Text>
            <TouchableOpacity onPress={() => router.push('/products')}>
              <Text className="text-[#4cc9f0] text-sm font-medium">See all →</Text>
            </TouchableOpacity>
          </View>
          <BestSellingProducts />
        </View>

        {/* Sezione Offers */}
        <View className="gap-4 border-t border-[#1e2f5a] pt-6">
          <View className="flex-row justify-between items-center">
            <Text className="text-white font-semibold text-[21px] tracking-[-0.3px]">Offers</Text>
            <TouchableOpacity onPress={() => router.push('/offers')}>
              <Text className="text-[#4cc9f0] text-sm font-medium">See all →</Text>
            </TouchableOpacity>
          </View>
          <Offers />
        </View>

      </View>
      </ScrollView>
    </SafeAreaView>
  );
}