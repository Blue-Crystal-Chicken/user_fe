import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { Product } from "@/type";
import { ProductDetails } from "@/components/product_details";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams(); // prende l'id dall'URL
  const [product, setProduct] = useState<Product | null>(null);

  const baseUrl = Platform.OS === "web"
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/products/v1/products/${id}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return null;

  return <ProductDetails product={product} />;
}