import { Product } from "@/type";
import { Text, View, ScrollView, TouchableOpacity, Platform } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";

const baseUrl = Platform.OS === 'web'
  ? process.env.EXPO_PUBLIC_API_URL_WEB
  : process.env.EXPO_PUBLIC_API_URL_MOBILE;

export function ProductDetails({ product }: { product: Product }) {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-background">

      {/* Immagine hero + freccia back */}
      <View className="relative">
        <Image
          source={{ uri: `${baseUrl}/${product.img_path}?t=${product.updatedAt}` }}
          style={{ width: "100%", height: 300 }}
          contentFit="cover"
          onError={(e) => console.log("Image error: ", e.error)}
        />
        {/* Freccia back */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-4 bg-black/40 rounded-full w-10 h-10 items-center justify-center"
        >
          <ArrowLeft color="white" size={20} />
        </TouchableOpacity>
      </View>

      {/* Contenuto */}
      <View className="p-5 gap-5">

        {/* Nome prodotto */}
        <Text className="text-3xl font-bold text-foreground">
          {product.name}
        </Text>

        {/* Descrizione + info nutrizionali + aggiunte */}
        <View className="bg-card border border-border rounded-2xl p-4 gap-3">
          {product.nutritionalInfo ? (
            <View className="gap-1 pt-2">
              <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Descrizione
              </Text>
              <Text className="text-base text-foreground leading-relaxed">
                {product.nutritionalInfo}
              </Text>
            </View>
          ) : null}

          {product.additions ? (
            <View className="gap-1 pt-2  border-t border-border">
              <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Aggiunte
              </Text>
              <Text className="text-base text-foreground">
                +{product.additions}€
              </Text>
            </View>
          ) : null}
        </View>

        {/* Ingredienti */}
        {product.ingredients?.length > 0 && (
          <View className="gap-2">
            <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Ingredienti
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {product.ingredients.map((ingredient) => (
                <View
                  key={ingredient.name}
                  className="bg-secondary rounded-full px-3 py-1"
                >
                  <Text className="text-xs text-secondary-foreground">
                    {ingredient.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Prezzo */}
        <View className="flex-row items-center justify-between pt-2 border-t border-border">
          <Text className="text-xl font-semibold text-foreground">Prezzo</Text>
          <Text className="text-2xl font-bold text-primary">
            {product.price}€
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}