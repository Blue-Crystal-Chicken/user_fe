import { Menu, Product } from "@/type";
import { Text, View, ScrollView, TouchableOpacity, Platform, StatusBar } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeft, Heart } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { FlatListCard } from "./flatListCard";
import { useAuth } from "./context/AuthContext";

const baseUrl = Platform.OS === 'web'
  ? process.env.EXPO_PUBLIC_API_URL_WEB
  : process.env.EXPO_PUBLIC_API_URL_MOBILE;

export function ProductDetails({ product }: { product: Product }) {
  const router = useRouter();
  const user = useAuth()?.user;
  const userId = user?.id;
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isFavorite, setIsFavorite] = useState(product.isFavorite);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/menus/product/${product.id}`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        console.log("Menu trovati per il prodotto:", data);
        setMenus(data);
      } catch (err) {
        console.error('Error fetching menus:', err);
      }
    };
    fetchMenus();
    console.log("Prodotto ID: " + product.id);
    console.log("Is Favorite: " + isFavorite);
  }, []);

  const backButtonTop = (Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 48) + 12;

  const toggleFavorite = () => {

    if (isFavorite) {
      const fetchFavorite = async () => {
        try {
          const response = await fetch(`${baseUrl}/api/products/favorite/v1/user/${userId}/${product.id}`, {
            method: "DELETE"
          });
          if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
          console.log(`Rimuovo ${product.name} dai preferiti`);
        } catch (err) {
          console.error('Error fetching favorite:', err);
        }
      };
      fetchFavorite();
    } else {
      const fetchFavorite = async () => {
        const favoriteData = { productId: product.id, userId: userId };
        try {
          const response = await fetch(`${baseUrl}/api/products/favorite/v1/user/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(favoriteData)
          });
          if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
          console.log(`Aggiungo ${product.name} ai preferiti`);
        } catch (err) {
          console.error('Error fetching favorite:', err);
        }
      };
      fetchFavorite();
    }
    setIsFavorite(!isFavorite);
  };

  return (
    <View className="flex-1 bg-[#0a0f1c]">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="relative h-[260px]">
          <Image
            source={{ uri: `${baseUrl}/${product.imgPath}?t=${product.updatedAt}` }}
            style={{ width: "100%", height: 260 }}
            contentFit="cover"
            transition={400}
          />
          <View className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0f1c]/40 to-[#0a0f1c]" />

          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute w-11 h-11 bg-black/60 border border-white/20 rounded-2xl items-center justify-center backdrop-blur-md"
            style={{ top: backButtonTop, left: 16 }}
          >
            <ArrowLeft color="#e0f0ff" size={24} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View className="px-5 -mt-6 relative z-10">
          <View className="flex-row items-start justify-between gap-3">
            <Text className="text-white text-[28px] font-semibold flex-1 leading-8 tracking-[-0.5px]">
              {product.name}
            </Text>

            <View className="bg-[#1e2f5a] border border-[#4cc9f066] rounded-2xl px-5 py-3 items-end">
              <Text className="text-[#4cc9f0] text-[21px] font-semibold">
                €{product.price.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-5 pt-8 gap-8 pb-6">
          {product.description && (
            <View className="bg-[#121a2e] border border-[#4cc9f033] rounded-3xl p-6">
              <Text className="text-[#67b8e0] text-xs font-medium uppercase tracking-[1.5px] mb-3">
                DESCRIZIONE
              </Text>
              <Text className="text-[#c0d4f0] text-[15px] leading-6">
                {product.description}
              </Text>
            </View>
          )}

          <View className="bg-[#121a2e] border border-[#4cc9f033] rounded-3xl p-6">
            <Text className="text-[#67b8e0] text-xs font-medium uppercase tracking-[1.5px] mb-5">
              CARATTERISTICHE
            </Text>

            <View className="flex-row flex-wrap gap-3">
              {product.calories && (
                <View className="bg-[#1e2f5a] px-5 py-3 rounded-2xl">
                  <Text className="text-[#4cc9f0] text-sm">🔥 {product.calories} kcal</Text>
                </View>
              )}
              {product.weight && (
                <View className="bg-[#1e2f5a] px-5 py-3 rounded-2xl">
                  <Text className="text-[#c0d4f0] text-sm">⚖️ {product.weight} g</Text>
                </View>
              )}
              {product.liters && (
                <View className="bg-[#1e2f5a] px-5 py-3 rounded-2xl">
                  <Text className="text-[#c0d4f0] text-sm">{product.liters} L</Text>
                </View>
              )}
              {product.size && (
                <View className="bg-[#1e2f5a] px-5 py-3 rounded-2xl">
                  <Text className="text-[#c0d4f0] text-sm">{product.size}</Text>
                </View>
              )}
              {product.flavor && (
                <View className="bg-[#1e2f5a] px-5 py-3 rounded-2xl">
                  <Text className="text-[#c0d4f0] text-sm">{product.flavor}</Text>
                </View>
              )}
              {product.isSpicy && (
                <View className="bg-[#1e2f5a] px-5 py-3 rounded-2xl">
                  <Text className="text-orange-400 text-sm">🌶️ Piccante</Text>
                </View>
              )}
              {!!product.isVegetarian && (
                <View className="bg-emerald-500/10 border border-emerald-500/30 px-5 py-3 rounded-2xl">
                  <Text className="text-emerald-400 text-sm">🥬 Vegetariano</Text>
                </View>
              )}
              {!!product.isVegan && (
                <View className="bg-green-500/10 border border-green-500/30 px-5 py-3 rounded-2xl">
                  <Text className="text-green-400 text-sm">🌱 Vegano</Text>
                </View>
              )}
              {!!product.isGlutenFree && (
                <View className="bg-amber-500/10 border border-amber-500/30 px-5 py-3 rounded-2xl">
                  <Text className="text-amber-400 text-sm">🌾 Senza glutine</Text>
                </View>
              )}
            </View>
          </View>

          {!!product.ingredients?.length && (
            <View>
              <Text className="text-[#67b8e0] text-xs font-medium uppercase tracking-[1.5px] mb-4 px-1">
                INGREDIENTI
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {product.ingredients.map((ingredient, index) => (
                  <View
                    key={index}
                    className="bg-[#1e2f5a] px-5 py-3 rounded-2xl border border-[#4cc9f022]"
                  >
                    <Text className="text-[#c0d4f0] text-sm">
                      {ingredient.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {menus.length > 0 && (
            <View className="bg-[#121a2e] border border-[#4cc9f033] rounded-3xl p-6">
              <Text className="text-[#67b8e0] text-xs font-medium uppercase tracking-[1.5px] mb-5">
                DISPONIBILE IN QUESTI MENU
              </Text>
              <FlatListCard menus={menus} />
            </View>
          )}
        </View>
      </ScrollView>

      <View 
        className="bg-[#0a0f1c] border-t border-[#1e2f5a] px-5 pt-5 pb-8 absolute bottom-0 left-0 right-0"
        style={{ paddingBottom: Platform.OS === "ios" ? 32 : 20 }}
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity 
            onPress={toggleFavorite}
            className="w-[54px] h-[54px] rounded-2xl bg-[#121a2e] border border-[#4cc9f044] items-center justify-center"
          >
            <Heart 
              color={isFavorite ? "#ff4d94" : "#4cc9f0"} 
              size={24} 
              strokeWidth={isFavorite ? 2.8 : 1.8}
              fill={isFavorite ? "#ff4d94" : "transparent"}
            />
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 bg-[#4cc9f0] rounded-3xl p-[17px] items-center">
            <Text className="text-[#0a0f1c] text-[16px] font-semibold">
              Aggiungi al carrello
            </Text>
            <Text className="text-[#0a0f1c]/80 text-[13px] mt-0.5">
              {product.price.toFixed(2)}€
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}