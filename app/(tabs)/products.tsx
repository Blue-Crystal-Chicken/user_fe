import * as React from 'react';
import { View, ScrollView, TouchableOpacity, FlatList, Platform, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Category, Product } from '@/type';
import { router } from 'expo-router';

const DEFAULT_CATEGORIES: Category[] = [{ id: "0", name: "All" }];

export default function ProductsScreen() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch categorie — dipendenza array vuoto, reset con costante
  const baseUrl = Platform.OS === 'web'
  ? process.env.EXPO_PUBLIC_API_URL_WEB
  : process.env.EXPO_PUBLIC_API_URL_MOBILE;
  useEffect(() => {

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/categories`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();
        setCategories([...DEFAULT_CATEGORIES, ...data]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch prodotti per categoria
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/products/v1/category/${selectedCategory}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [selectedCategory]);


  const getImageUrl = (imagePath: string) => {
  if (!imagePath) return null;

  // Se l'URL è già completo (es. http://...)
  if (imagePath.startsWith('http')) return imagePath;

  // Se è relativo, aggiungi il dominio
  return `${baseUrl}/${imagePath}`;
};


  return (
    <View className="flex-1 bg-background">

      {/* Sezione categorie */}
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.name)}
              className={cn(
                'px-4 py-2 rounded-full border border-border mr-2',
                selectedCategory === category.name ? 'bg-primary border-primary' : 'bg-secondary'
              )}
            >
              <Text
                className={cn(
                  'text-sm font-medium',
                  selectedCategory === category.name
                    ? 'text-primary-foreground'
                    : 'text-secondary-foreground'
                )}
              >
                {category.name.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sezione prodotti */}
      <View className="flex-1 p-4">
        <Text className="text-xl font-semibold mb-4">
          {selectedCategory.replace('_', ' ')}
        </Text>

        {products.length > 0 ? (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/product/${item.id}` as any)}
                className="flex-1"
              >
                <Card className="flex-1">
                  <CardContent>
                    {item.img_path ? (
                    <Image
                      source={{ uri: `${baseUrl}/${item.img_path}?t=${item.updatedAt}` }}
                      style={{ width: '100%', height: 96 }}
                      resizeMode="cover"
                    />
                  ) : null}
                    <Text className="text-sm text-muted-foreground">{item.name}</Text>
                    <Text className="font-bold mt-1">{item.price}0€</Text>
                  </CardContent>
                </Card>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">No products found</Text>
          </View>
        )}
      </View>

    </View>
  );
}