import * as React from 'react';
import { View, ScrollView, TouchableOpacity, FlatList, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Menu } from '@/type';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowRight } from 'lucide-react-native';

const baseUrl = Platform.OS === 'web'
  ? process.env.EXPO_PUBLIC_API_URL_WEB
  : process.env.EXPO_PUBLIC_API_URL_MOBILE;

export default function MenusScreen() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tutti i menu
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}/api/menus`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data: Menu[] = await response.json();
        setMenus(data);
      } catch (err) {
        console.error("Error fetching menus:", err);
        setError("Impossibile caricare i menu");
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const getMenuImgUrl = (imagePath?: string | null, updatedAt?: string): string | undefined => {
    if (!imagePath) return undefined;
    const timestamp = updatedAt ? `?t=${updatedAt}` : '';
    if (imagePath.startsWith('http')) return `${imagePath}${timestamp}`;
    return `${baseUrl}/${imagePath}${timestamp}`;
  };

  return (
    <View className="flex-1 bg-[#0a0f1c]">
      
      {/* Header con titolo */}
      <View className="pt-6 pb-5 px-5">
        <Text className="text-white text-[28px] font-semibold tracking-[-0.5px]">
          I Nostri Menu
        </Text>
        <Text className="text-[#8ab4e0] text-sm mt-1">
          Scegli il menu perfetto per te
        </Text>
      </View>

      {/* Lista dei Menu */}
      <View className="flex-1 px-5">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-[#8ab4e0]">Caricamento menu...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-red-400">{error}</Text>
          </View>
        ) : menus.length > 0 ? (
          <FlatList
            data={menus}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ gap: 14 }}
            contentContainerStyle={{ paddingBottom: 100, gap: 14 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/menu/${item.id}` as any)}
                className="flex-1 active:opacity-90"
              >
                <View className="flex-1 bg-[#121a2e] border border-[#4cc9f033] rounded-3xl overflow-hidden">
                  
                  {/* Immagine del Menu */}
                  <View className="relative">
                    {item.imgPath ? (
                      <Image
                        source={{ uri: getMenuImgUrl(item.imgPath, item.updatedAt) }}
                        style={{ width: '100%', height: 148 }}
                        contentFit="cover"
                        transition={300}
                        onError={(e) => console.log("Image error:", e.error)}
                      />
                    ) : (
                      <View className="w-full h-[148px] bg-[#1e2f5a] flex items-center justify-center">
                        <Text className="text-[#67b8e0] text-xs">No image</Text>
                      </View>
                    )}
                  </View>

                  {/* Contenuto della Card */}
                  <View className="p-4">
                    <Text 
                      numberOfLines={2}
                      className="text-white font-medium text-[16px] leading-5 mb-3"
                    >
                      {item.name}
                    </Text>

                    {item.description && (
                      <Text 
                        numberOfLines={2}
                        className="text-[#8ab4e0] text-[13px] leading-5 mb-4"
                      >
                        {item.description}
                      </Text>
                    )}

                    <View className="flex-row items-center justify-between">
                      <Text className="text-[#4cc9f0] text-[19px] font-semibold">
                        €{item.price.toFixed(2)}
                      </Text>

                      <View className="flex-row items-center gap-1">
                        <Text className="text-[#67b8e0] text-xs">
                          {item.menuProducts?.length || 0} prodotti
                        </Text>
                        <ArrowRight color="#4cc9f088" size={16} />
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-[#8ab4e0] text-lg">Nessun menu disponibile al momento</Text>
          </View>
        )}
      </View>
    </View>
  );
}