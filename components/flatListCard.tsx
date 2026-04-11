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
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => (
                <TouchableOpacity
                    onPress={() => router.push(`/menu/${item.id}` as Href)}
                    style={{ width: 280 }}
                >
                    <View className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                        <Image
                            source={{ uri: getMenuImgUrl(item.imgPath, item.updatedAt) }}
                            style={{ width: 280, height: 160 }}
                            contentFit="cover"
                            transition={200}
                        />
                        <View className="p-3">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-white font-bold text-lg">{item.name}</Text>
                                <Text className="text-green-400 font-bold text-lg">€{item.price.toFixed(2)}</Text>
                            </View>
                            <Text className="text-gray-400 text-sm mt-1" numberOfLines={2}>
                                {item.description}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )}
        />
    )


}