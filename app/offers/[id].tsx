import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, View, ActivityIndicator } from "react-native";
import { Offer } from "@/type";
import { OfferDetails } from "@/components/offer_details";
import { Text } from "@/components/ui/text";

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = Platform.OS === "web"
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;

  useEffect(() => {
    const fetchOffer = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}/api/offers/${id}`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        setOffer(data);
      } catch (err) {
        console.error("Error fetching offer:", err);
        setError("Impossibile caricare i dettagli dell'offerta");
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0f1c]">
        <ActivityIndicator size="large" color="#4cc9f0" />
      </View>
    );
  }

  if (error || !offer) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0f1c]">
        <Text className="text-red-400">{error || "Offerta non trovata"}</Text>
      </View>
    );
  }

  return <OfferDetails offer={offer} />;
}
