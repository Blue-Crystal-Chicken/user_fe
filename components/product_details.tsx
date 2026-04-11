import { Menu, Product } from "@/type";
import { Text, View, ScrollView, TouchableOpacity, Platform, StatusBar } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { FlatListCard } from "./flatListCard";

const baseUrl = Platform.OS === 'web'
  ? process.env.EXPO_PUBLIC_API_URL_WEB
  : process.env.EXPO_PUBLIC_API_URL_MOBILE;

export function ProductDetails({ product }: { product: Product }) {
  const router = useRouter();
  const [menu,setMenu] = useState<Menu[]> ([])
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
          const fetchMenus = async () => {
              try {
                  const response = await fetch(`${baseUrl}/api/menus`);
                  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
                  const data = await response.json();
                  setMenu(data);
              } catch (err) {
                  console.error('Error fetching menus:', err);
                  setError('Impossibile caricare i menu');
              }
          };
          fetchMenus();
      }, []);

  return (
    <ScrollView 
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 40 }} // spazio extra ridotto sotto
    >
      {/* Hero Image con spazio per lo status bar */}
      <View className="relative">
        <Image
          source={{ uri: `${baseUrl}/${product.imgPath}?t=${product.updatedAt}` }}
          style={{ width: "100%", height: 240 }}  
          contentFit="cover"
          transition={300}
          onError={(e) => console.log("Image error: ", e.error)}
        />

        {/* Back Button - con margine sicuro */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-5 bg-black/60 backdrop-blur-md rounded-full w-11 h-11 items-center justify-center active:bg-black/80 z-10"
          style={{
            marginTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
          }}
        >
          <ArrowLeft color="white" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Nome del prodotto - grande, sotto l'immagine */}
      <View className="px-5 pt-6 pb-2">
        <Text className="text-3xl font-bold text-foreground tracking-tight">
          {product.name}
        </Text>
      </View>

      <View className="px-5 gap-7 pb-8">
        {/* Descrizione */}
        {product.description && (
          <View className="bg-card border border-border rounded-3xl p-6">
            <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              DESCRIZIONE
            </Text>
            <Text className="text-base text-foreground leading-relaxed">
              {product.description}
            </Text>
          </View>
        )}

        {/* Caratteristiche */}
        <View className="bg-card border border-border rounded-3xl p-6 gap-5">
          <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            CARATTERISTICHE
          </Text>

          <View className="flex-row flex-wrap gap-3">
            {product.calories && (
              <View className="bg-secondary px-4 py-2.5 rounded-2xl">
                <Text className="text-sm text-foreground">🔥 {product.calories} kcal</Text>
              </View>
            )}

            {product.weight && (
              <View className="bg-secondary px-4 py-2.5 rounded-2xl">
                <Text className="text-sm text-foreground">⚖️ {product.weight} g</Text>
              </View>
            )}

            {product.liters && (
              <View className="bg-secondary px-4 py-2.5 rounded-2xl">
                <Text className="text-sm text-foreground">{product.liters} L</Text>
              </View>
            )}

            {product.quantity && (
              <View className="bg-secondary px-4 py-2.5 rounded-2xl">
                <Text className="text-sm text-foreground">{product.quantity} </Text>
              </View>
            )}

            {product.size && (
              <View className="bg-secondary px-4 py-2.5 rounded-2xl">
                <Text className="text-sm text-foreground">{product.size} </Text>
              </View>
            )}

            {product.flavor && (
              <View className="bg-secondary px-4 py-2.5 rounded-2xl">
                <Text className="text-sm text-foreground">{product.flavor} </Text>
              </View>
            )}

            {product.temperature && (
              <View className="bg-secondary px-4 py-2.5 rounded-2xl">
                <Text className="text-sm text-foreground">{product.temperature}</Text>
              </View>
            )}

            {product.isCarbonated && (
              <View className="bg-secondary px-4 py-2.5 rounded-2xl">
                <Text className="text-sm text-foreground">{product.isCarbonated ? "Frizzante" : "Naturale"}</Text>
              </View>
            )}

            {product.isSpicy && (
                  <View className="bg-secondary px-4 py-2.5 rounded-2xl">
                    <Text className="text-sm text-foreground">🌶️ Piccante</Text>
                  </View>
            )}

            {product.isVegetarian && (
              <View className="bg-emerald-500/10 px-4 py-2.5 rounded-2xl">
                <Text className="text-sm text-emerald-600">🥬 Vegetariano</Text>
              </View>
            )}

            {product.isVegan && (
              <View className="bg-green-600/10 px-4 py-2.5 rounded-2xl">
                <Text className="text-sm text-green-600">🌱 Vegano</Text>
              </View>
            )}

            {product.isGlutenFree && (
              <View className="bg-amber-500/10 px-4 py-2.5 rounded-2xl">
                <Text className="text-sm text-amber-600">🌾 Senza glutine</Text>
              </View>
            )}

            {product.additions && (
              <View className="bg-emerald-500/10 px-4 py-2.5 rounded-2xl">
                <Text className="text-sm text-emerald-600">+{product.additions}€ aggiunte</Text>
              </View>
            )}
          </View>
        </View>

        {/* Ingredienti */}
        {product.ingredients?.length > 0 && (
          <View className="gap-4">
            <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
              INGREDIENTI
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {product.ingredients.map((ingredient, index) => (
                <View
                  key={index}
                  className="bg-secondary rounded-2xl px-5 py-2.5"
                >
                  <Text className="text-sm text-secondary-foreground">
                    {ingredient.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {/* Menu */}
        {
          menu &&(
            <View className="bg-card border border-border rounded-3xl p-6 gap-5">
              <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
              MENU
            </Text>
            <FlatListCard menus={menu} />
            </View>
          )
        }
      </View>

      {/* Prezzo fisso in fondo */}
      <View className="border-t border-border bg-background px-5 pt-6 pb-2">
        <View className="bg-card border border-border rounded-3xl p-5 flex-row items-center justify-between">
          <Text className="text-muted-foreground text-base">Prezzo totale</Text>
          <Text className="text-4xl font-bold text-foreground">
            {product.price.toFixed(2)}€
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}