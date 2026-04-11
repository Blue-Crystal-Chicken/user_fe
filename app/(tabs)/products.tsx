import * as React from 'react';
import { View, ScrollView, TouchableOpacity, FlatList, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Category, Product } from '@/type';
import { router } from 'expo-router';
import { Image } from 'expo-image';

const DEFAULT_CATEGORIES: Category[] = [{ id: "0", name: "All" }];

export default function ProductsScreen() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

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
        const response = await fetch(`${baseUrl}/api/products/v1/category/${selectedCategory}`);
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
    <View className="flex-1 bg-background">
      {/* Categorie */}
      <View className="pt-5 pb-4 px-5">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.name)}
              className={cn(
                "px-6 py-3 rounded-2xl border transition-all active:scale-95",
                selectedCategory === category.name 
                  ? "bg-primary border-primary" 
                  : "bg-card border-border"
              )}
            >
              <Text
                className={cn(
                  "text-sm font-semibold",
                  selectedCategory === category.name 
                    ? "text-primary-foreground" 
                    : "text-foreground"
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
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-xl font-semibold tracking-tight">
            {selectedCategory === "All" 
              ? "Tutti i prodotti" 
              : selectedCategory.replace('_', ' ')
            }
          </Text>
          <Text className="text-sm text-muted-foreground">
            {products.length} prodotti
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">Caricamento...</Text>
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
                <Card className="flex-1 overflow-hidden border border-border/80">
                  <View>
                    {item.imgPath ? (
                      <Image
                        source={{ 
                          uri: getImageUrl(item.imgPath, item.updatedAt) 
                        }}
                        style={{ width: '100%', height: 140 }}
                        contentFit="cover"
                        transition={200}
                        onError={(e) => console.log("Image error:", e.error)}
                      />
                    ) : (
                      <View className="w-full h-[140px] bg-muted flex items-center justify-center">
                        <Text className="text-muted-foreground text-xs">No image</Text>
                      </View>
                    )}
                  </View>

                  <CardContent className="p-4 pt-3">
                    <Text 
                      numberOfLines={2}
                      className="font-semibold text-base leading-tight mb-2"
                    >
                      {item.name}
                    </Text>

                    <View className="flex-row items-center justify-between">
                      <Text className="text-xl font-bold text-foreground">
                        {parseFloat(String(item.price)).toFixed(2)}€
                      </Text>
                      
                      {item.isSpicy && (
                        <Text className="text-orange-500 text-lg">🌶️</Text>
                      )}
                    </View>
                  </CardContent>
                </Card>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-muted-foreground text-lg">Nessun prodotto trovato</Text>
          </View>
        )}
      </View>
    </View>
  );
}