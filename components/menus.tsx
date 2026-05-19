import { View, Platform, ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Text } from "./ui/text";
import { useState, useEffect } from "react";
import { Menu } from "@/type";
import { FlatListCard } from "./flatListCard";

const baseUrl = Platform.OS === 'web'
  ? process.env.EXPO_PUBLIC_API_URL_WEB
  : process.env.EXPO_PUBLIC_API_URL_MOBILE;

export function Menus() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}/api/menus`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        setMenus(data);
      } catch (err) {
        console.error('Error fetching menus:', err);
        setError('Impossibile caricare i menu');
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  if (loading) return <ActivityIndicator className="mt-6" color="#4cc9f0" />;
  if (error) return <Text className="text-red-400 mt-6 px-5">{error}</Text>;
  if (menus.length === 0) return <Text className="text-[#8ab4e0] mt-6 px-5">Nessun menu disponibile</Text>;

  return <FlatListCard menus={menus} />;
}