import * as React from 'react';
import { View, ScrollView, TouchableOpacity, FlatList, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Category, Product } from '@/type';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from "@/components/context/AuthContext";

const DEFAULT_CATEGORIES: Category[] = [{ id: "0", name: "All" }, { id: "favorites", name: "FAVORITES" }];

export default function ProductsScreen() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useAuth().user;
  const userId = user?.id;

  const baseUrl = Platform.OS === 'web'
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;

  // Fetch categorie
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/categories`);
        const data: Category[] = await response.json();
        setCategories([...DEFAULT_CATEGORIES, ...data]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch prodotti
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${baseUrl}/api/products/v1/category/${selectedCategory}/${userId}`);
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    for(var i = 0; i < products.length; i++){
      console.log("ID del prodotto: " + products[i].id);
      console.log("Nome del prodotto: " + products[i].name);
      console.log("Prezzo del prodotto: " + products[i].price);
      console.log("Descrizione del prodotto: " + products[i].description);
      console.log("Immagine del prodotto: " + products[i].imgPath);
      console.log("Aggiornato il: " + products[i].updatedAt);
      console.log("È preferito: " + products[i].isFavorite);
    }
  }, [selectedCategory]);


  // Funzione sicura per generare l'URL dell'immagine
  const getImageUrl = (imagePath?: string | null, updatedAt?: string): string | undefined => {
    if (!imagePath) return undefined;

    const timestamp = updatedAt ? `?t=${updatedAt}` : '';
    
    if (imagePath.startsWith('http')) {
      return `${imagePath}${timestamp}`;
    }
    
    return `${baseUrl}/${imagePath}${timestamp}`;
  };

  return (
    <View className="flex-1 bg-[#0a0f1c]">
      
      {/* Categorie - Crystal Style */}
      <View className="pt-6 pb-5 px-5">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.name)}
              className={cn(
                "px-7 py-[13px] rounded-2xl border transition-all active:scale-[0.96]",
                selectedCategory === category.name 
                  ? "bg-[#4cc9f0] border-[#4cc9f0]" 
                  : "bg-[#121a2e] border-[#4cc9f033]"
              )}
            >
              <Text
                className={cn(
                  "text-sm font-semibold tracking-wide",
                  selectedCategory === category.name 
                    ? "text-[#0a0f1c]" 
                    : "text-[#c0d4f0]"
                )}
              >
                {category.name.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista Prodotti */}
      <View className="flex-1 px-5">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-white text-[22px] font-semibold tracking-[-0.4px]">
            {selectedCategory === "All" 
              ? "Tutti i prodotti" 
              : selectedCategory.replace('_', ' ')
            }
          </Text>
          <Text className="text-[#8ab4e0] text-sm">
            {products.length} prodotti
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-[#8ab4e0]">Caricamento...</Text>
          </View>
        ) : products.length > 0 ? (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}   
            numColumns={2}
            columnWrapperStyle={{ gap: 14 }}
            contentContainerStyle={{ paddingBottom: 100, gap: 14 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/product/${item.id}`)}   
                className="flex-1 active:opacity-90"
              >
                <View className="flex-1 bg-[#121a2e] border border-[#4cc9f033] rounded-3xl overflow-hidden">
                  
                  {/* Immagine */}
                  <View>
                    {item.imgPath ? (
                      <Image
                        source={{ 
                          uri: getImageUrl(item.imgPath, item.updatedAt) 
                        }}
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

                  {/* Contenuto */}
                  <View className="p-4 pt-3">
                    <Text 
                      numberOfLines={2}
                      className="text-white font-medium text-[15.5px] leading-5 mb-3"
                    >
                      {item.name}
                    </Text>

                    <View className="flex-row items-center justify-between">
                      <Text className="text-[#4cc9f0] text-[19px] font-semibold">
                        €{parseFloat(String(item.price)).toFixed(2)}
                      </Text>
                      
                      {item.isSpicy && (
                        <Text className="text-orange-400 text-xl">🌶️</Text>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-[#8ab4e0] text-lg">Nessun prodotto trovato</Text>
          </View>
        )}
      </View>
    </View>
  );
}