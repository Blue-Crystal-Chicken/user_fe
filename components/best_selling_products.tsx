import { useState, useEffect } from 'react';
import { Product } from '@/type';
import { View, Platform, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

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

  if (loading) return <ActivityIndicator className="mt-4" />;
  if (error) return <Text className="text-red-500 mt-4">{error}</Text>;
  if (bestProducts.length === 0) return <Text className="text-gray-400 mt-4">Nessun prodotto disponibile</Text>;

  return (
    <FlatList
      data={bestProducts}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/product/${item.id}`)}
          style={{ width: 160 }}
        >
          <View className="rounded-2xl overflow-hidden bg-zinc-900">
            <Image
              source={{ uri: getImageUrl(item.imgPath, item.updatedAt) }}
              style={{ width: 160, height: 160 }}
              contentFit="cover"
              transition={200}
              onError={(e) => console.log('Image error:', e.error)}
            />
            <View className="p-2">
              <Text
                className="text-white font-semibold text-sm"
                numberOfLines={2}
              >
                {item.name}
              </Text>
              {item.price && (
                <Text className="text-green-400 text-xs mt-1">
                  €{item.price}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}