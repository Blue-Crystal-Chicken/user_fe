import { View, Platform, ActivityIndicator } from "react-native";
import { Text } from "./ui/text";
import { useState, useEffect } from "react";
import { Offer } from "@/type";
import { FlatListOfferCard } from "./flatListOfferCard";

const baseUrl = Platform.OS === 'web'
  ? process.env.EXPO_PUBLIC_API_URL_WEB
  : process.env.EXPO_PUBLIC_API_URL_MOBILE;

export function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        // Fetch top 5 offers using /top-offers endpoint
        const response = await fetch(`${baseUrl}/api/offers/v1/top?limit=5`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        // data is now a List<Offer>, not a Page object
        setOffers(data || []);
      } catch (err: any) {
        console.error('Error fetching offers:', err);
        setError('Impossibile caricare le offerte: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  if (loading) return <ActivityIndicator className="mt-6" color="#4cc9f0" />;
  if (error) return <Text className="text-red-400 mt-6 px-5">{error}</Text>;
  if (offers.length === 0) return <Text className="text-[#8ab4e0] mt-6 px-5">Nessuna offerta disponibile</Text>;

  return <FlatListOfferCard offers={offers} />;
}
