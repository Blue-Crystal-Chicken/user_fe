import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Platform, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import { Product } from "@/type";
import { ProductDetails } from "@/components/product_details";
import { useAuth } from "@/components/context/AuthContext";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); 
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuth()?.user;
  const userId = user?.id;

  const baseUrl = Platform.OS === "web"
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const url = userId 
          ? `${baseUrl}/api/products/v1/products/${id}/${userId}`
          : `${baseUrl}/api/products/v1/products/${id}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data: Product = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, userId]);

  // Loader durante il caricamento
  if (loading) {
    return (
      <View className="flex-1 bg-[#0a0f1c] items-center justify-center">
        <ActivityIndicator size="large" color="#4cc9f0" />
        <Text className="text-[#8ab4e0] mt-4 text-sm">Caricamento prodotto...</Text>
      </View>
    );
  }

  // Se non trova il prodotto
  if (!product) {
    return (
      <View className="flex-1 bg-[#0a0f1c] items-center justify-center px-6">
        <Text className="text-white text-xl font-medium text-center">
          Prodotto non trovato
        </Text>
        <Text className="text-[#8ab4e0] mt-3 text-center">
          Il prodotto che stai cercando non esiste o è stato rimosso.
        </Text>
      </View>
    );
  }

  return <ProductDetails product={product} />;
}