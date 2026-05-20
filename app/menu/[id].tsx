import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { Menu } from "@/type";
import { MenuDetails } from "@/components/menu_details";
import { useAuth } from "@/components/context/AuthContext";

export default function MenuDetailScreen() {
  const { id } = useLocalSearchParams(); // prende l'id dall'URL
  const [menu, setMenu] = useState<Menu | null>(null);
  const user = useAuth()?.user;
  const userId = user?.id;

  const baseUrl = Platform.OS === "web"
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;

  useEffect(() => {
    const fetchMenu = async () => {
      if (!id) return;
      try {
        const url = userId 
          ? `${baseUrl}/api/menus/v1/menus/${id}/${userId}`
          : `${baseUrl}/api/menus/${id}`;
        const response = await fetch(url);
        const data = await response.json();
        setMenu(data);
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    };
    fetchMenu();
  }, [id, userId]);

  if (!menu) return null;

  return <MenuDetails menu={menu} />;
}