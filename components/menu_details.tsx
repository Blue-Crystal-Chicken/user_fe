import { Menu } from "@/type";
import { Image } from "expo-image";
import { Platform, ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { ArrowLeft, Heart, ChevronRight } from "lucide-react-native";
import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";

const CRYSTAL_COLORS = [
  { bg: "#0f1b3a", border: "#4cc9f033", inner: "#67d8ff", innerEnd: "#1e3a7a" },
  { bg: "#0a1428", border: "#5ce1d633", inner: "#4cc9f0", innerEnd: "#0f1b3a" },
  { bg: "#11203d", border: "#a0e0ff33", inner: "#8ed6ff", innerEnd: "#1e3a7a" },
  { bg: "#0c1a35", border: "#67b8e033", inner: "#5ce1e6", innerEnd: "#0f253f" },
];

function ProductIcon({ index }: { index: number }) {
  const color = CRYSTAL_COLORS[index % CRYSTAL_COLORS.length];
  return (
    <View className="w-10 h-10 rounded-[12px] bg-[#0f182e] border border-[#4cc9f044] items-center justify-center overflow-hidden">
      <View
        className="w-6 h-6 rounded-full"
        style={{
          backgroundColor: color.inner,
          shadowColor: color.inner,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 8,
        }}
      />
    </View>
  );
}

export function MenuDetails({ menu }: { menu: Menu }) {
  const router = useRouter();
  const user = useAuth()?.user;
  const userId = user?.id;
  const [isFavorite, setIsFavorite] = useState(menu.isFavorite);

  const baseUrl = Platform.OS === "web"
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;

  const totalSingoli = menu.menuProducts.reduce(
    (acc, p) => acc + p.unitPrice * p.quantity, 0
  );
  const risparmio = totalSingoli - menu.price;

  const backButtonTop = (Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 48) + 8;

  const toggleFavorite = () => {
    if (isFavorite) {
      const fetchFavorite = async () => {
        try {
          const response = await fetch(`${baseUrl}/api/menus/favorite/v1/user/${userId}/${menu.id}`, {
            method: "DELETE"
          });
          if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        } catch (err) {
          console.error('Error deleting favorite menu:', err);
        }
      };
      fetchFavorite();
    } else {
      const fetchFavorite = async () => {
        const favoriteData = { menuId: menu.id, userId: userId };
        try {
          const response = await fetch(`${baseUrl}/api/menus/favorite/v1/user/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(favoriteData)
          });
          if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        } catch (err) {
          console.error('Error adding favorite menu:', err);
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
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO - Crystal Blue */}
        <View className="relative h-[240px] bg-[#0a1428] overflow-hidden">
          {menu.imgPath ? (
            <Image
              source={{ uri: `${baseUrl}/${menu.imgPath}?t=${menu.updatedAt}` }}
              style={{ width: "100%", height: 240 }}
              contentFit="cover"
              transition={400}
              onError={(e) => console.log("Image error:", e.error)}
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-[#0f1b3a]">
              <View className="w-[130px] h-[130px] rounded-full bg-[#1e2f5a] border-[3px] border-[#4cc9f055] items-center justify-center">
                <View className="w-[95px] h-[95px] rounded-full bg-[#2a4a7f] border-2 border-[#67d8ff66] items-center justify-center">
                  <View className="w-[62px] h-[62px] rounded-full bg-[#4cc9f0]" />
                </View>
              </View>
            </View>
          )}

          {/* Crystal overlay */}
          <View className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0f1c]/30 to-[#0a0f1c]" />

          {/* back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-4 w-10 h-10 rounded-2xl bg-black/50 border border-white/20 items-center justify-center backdrop-blur-md"
            style={{ top: backButtonTop }}
          >
            <ArrowLeft color="#e0f0ff" size={20} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View className="px-5 pt-5">

          {/* TITOLO + PREZZO */}
          <View className="flex-row items-start justify-between gap-3">
            <Text className="text-[23px] font-semibold text-white flex-1 leading-7 tracking-[-0.3px]">
              {menu.name}
            </Text>
            <View className="bg-[#1e2f5a] border border-[#4cc9f066] rounded-2xl p-3 items-end">
              <Text className="text-[18px] font-semibold text-[#4cc9f0]">
                {menu.price.toFixed(2)}€
              </Text>
            </View>
          </View>

          {/* DESCRIZIONE */}
          {menu.description && (
            <View className="bg-[#121a2e] border border-[#4cc9f022] rounded-3xl p-5 mt-6 mb-6">
              <Text className="text-[10px] font-medium text-[#67b8e0] uppercase tracking-[1.5px] mb-2">
                Descrizione
              </Text>
              <Text className="text-[13.5px] text-[#c0d4f0] leading-6">
                {menu.description}
              </Text>
            </View>
          )}

          {/* PRODOTTI */}
          <Text className="text-[10px] font-medium text-[#67b8e0] uppercase tracking-[1.5px] mb-3 pl-1">
            Prodotti inclusi
          </Text>

          {menu.menuProducts.map((product, index) => (
            <TouchableOpacity
              key={product.productId}
              onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.productId } })}
              className="flex-row items-center gap-4 bg-[#121a2e] border border-[#4cc9f033] rounded-3xl p-4 mb-3 active:opacity-90"
            >
              <ProductIcon index={index} />

              <View className="flex-1 min-w-0">
                <Text className="text-[13.5px] font-medium text-white mb-1" numberOfLines={1}>
                  {product.productName}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-[11px] text-[#8ab4e0]">x{product.quantity}</Text>
                  <View
                    className={
                      product.obligatory
                        ? "bg-[#4cc9f022] border border-[#4cc9f044] rounded-full px-3 py-0.5"
                        : "bg-[#2a3a5a] border border-[#334a7a] rounded-full px-3 py-0.5"
                    }
                  >
                    <Text
                      className={
                        product.obligatory
                          ? "text-[9.5px] text-[#4cc9f0] font-medium"
                          : "text-[9.5px] text-[#8ab4e0]"
                      }
                    >
                      {product.obligatory ? "obbligatorio" : "opzionale"}
                    </Text>
                  </View>
                </View>
              </View>

              <Text className="text-[13px] text-[#8ab4e0] shrink-0 font-medium">
                {product.unitPrice.toFixed(2)}€
              </Text>
              <ChevronRight color="#4cc9f088" size={16} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* CTA FISSA - Crystal Style */}
      <View
        className="bg-[#0a0f1c] border-t border-[#1e2f5a] p-4 flex-row items-center gap-3"
        style={{ paddingBottom: Platform.OS === "ios" ? 32 : 20 }}
      >
        <TouchableOpacity 
          onPress={toggleFavorite}
          className="w-[50px] h-[50px] rounded-2xl bg-[#121a2e] border border-[#4cc9f044] items-center justify-center"
        >
          <Heart 
            color={isFavorite ? "#ff4d94" : "#4cc9f0"} 
            size={20} 
            strokeWidth={isFavorite ? 2.8 : 1.8}
            fill={isFavorite ? "#ff4d94" : "transparent"}
          />
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 bg-[#4cc9f0] rounded-3xl p-4 items-center shadow-lg shadow-[#4cc9f0]/50">
          <Text className="text-[15px] font-semibold text-[#0a0f1c]">
            Aggiungi al carrello
          </Text>
          <Text className="text-[11.5px] text-[#0a0f1c]/80 mt-0.5">
            {menu.price.toFixed(2)}€ · {menu.menuProducts.length} prodotti
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}