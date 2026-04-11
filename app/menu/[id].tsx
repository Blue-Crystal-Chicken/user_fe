import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { Menu } from "@/type";
import { MenuDetails } from "@/components/menu_details";

export default function MenuDetailScreen() {
  const { id } = useLocalSearchParams(); // prende l'id dall'URL
  const [menu, setMenu] = useState<Menu | null>(null);

  const baseUrl = Platform.OS === "web"
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/menus/${id}`);
        const data = await response.json();
        setMenu(data);
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    };
    fetchMenu();
  }, [id]);

  if (!menu) return null;

  return <MenuDetails menu={menu} />;
}