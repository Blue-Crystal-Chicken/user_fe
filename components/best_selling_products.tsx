import { useState, useEffect } from 'react';
import { Product } from '@/type';
import { View, Platform, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';

const baseUrl = Platform.OS === 'web'
  ? process.env.EXPO_PUBLIC_API_URL_WEB
  : process.env.EXPO_PUBLIC_API_URL_MOBILE;

const getImageUrl = (imagePath?: string | null, updatedAt?: string): string | undefined => {
  if (!imagePath) return undefined;
  const timestamp = updatedAt ? `?t=${updatedAt}` : '';
  if (imagePath.startsWith('http')) return `${imagePath}${timestamp}`;
  return `${baseUrl}/${imagePath}${timestamp}`;
};

export function BestSellingProducts() {
  const [bestProducts, setBestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${baseUrl}/api/products/v1/best_selling?limit=5`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data: Product[] = await response.json();
        setBestProducts(data);
      } catch (err) {
        console.error('Error fetching best selling products:', err);
        setError('Impossibile caricare i prodotti');
        setBestProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <ActivityIndicator className="mt-6" color="#4cc9f0" />;
  if (error) return <Text className="text-red-400 mt-6 px-5">{error}</Text>;
  if (bestProducts.length === 0) return <Text className="text-[#8ab4e0] mt-6 px-5">Nessun prodotto disponibile</Text>;

  return (
    <FlatList
      data={bestProducts}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/product/${item.id}`)}
          activeOpacity={0.85}
          style={{ width: 172 }}   // larghezza fissa
        >
          <View className="rounded-3xl overflow-hidden bg-[#121a2e] border border-[#4cc9f033] h-[248px] flex-col">
            
            {/* Immagine - altezza fissa */}
            <Image
              source={{ uri: getImageUrl(item.imgPath, item.updatedAt) }}
              style={{ width: '100%', height: 150 }}
              contentFit="cover"
              transition={300}
              onError={(e) => console.log('Image error:', e.error)}
            />

            {/* Contenuto testo - altezza fissa */}
            <View className="flex-1 p-4 justify-between">
              <Text
                className="text-white font-medium text-[15px] leading-[20px]"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.name}
              </Text>

              {/* Prezzo sempre in basso */}
              {item.price && (
                <Text className="text-[#4cc9f0] font-semibold text-[17px] mt-auto">
                  €{item.price.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}