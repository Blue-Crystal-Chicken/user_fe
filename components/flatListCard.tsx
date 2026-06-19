import { Menu } from "@/type";
import { FlatList, TouchableOpacity, View, Platform } from "react-native";
import { Image } from "expo-image";
import { Text } from "./ui/text";
import { useRouter, Href } from "expo-router";

const baseUrl = Platform.OS === 'web'
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;

const getMenuImgUrl = (imagePath?: string | null, updatedAt?: string): string | undefined => {
    if (!imagePath) return undefined;
    const timestamp = updatedAt ? `?t=${updatedAt}` : '';
    if (imagePath.startsWith('http')) return `${imagePath}${timestamp}`;
    return `${baseUrl}/${imagePath}${timestamp}`;
};

export function FlatListCard({ menus }: { menus: Menu[] }) {
    const router = useRouter();

    return (
        <FlatList
            data={menus}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
            renderItem={({ item }) => (
                <TouchableOpacity
                    onPress={() => router.push(`/menu/${item.id}` as Href)}
                    style={{ width: 280 }}
                    activeOpacity={0.85}
                >
                    <View className="rounded-3xl overflow-hidden bg-[#121a2e] border border-[#4cc9f033] h-[268px] flex-col">
                        
                        {/* Immagine */}
                        <Image
                            source={{ uri: getMenuImgUrl(item.imgPath, item.updatedAt) }}
                            style={{ width: 280, height: 172 }}
                            contentFit="cover"
                            transition={300}
                            onError={(e) => console.log('Image error:', e.error)}
                        />

                        {/* Contenuto testo - altezza fissa */}
                        <View className="flex-1 p-4 justify-between">
                            <View>
                                <View className="flex-row justify-between items-start">
                                    <Text className="text-white">
                                       {item.name}
                                    </Text>
                                    <Text className="text-lg text-[#4cc9f0] font-semibold  shrink-0">
                                        €{item.price.toFixed(2)}
                                    </Text>
                                </View>

                                {item.description && (
                                    <Text 
                                        className="text-[#8ab4e0] text-[13px] leading-5"
                                        numberOfLines={2}
                                        ellipsizeMode="tail"
                                    >
                                        {item.description}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
}