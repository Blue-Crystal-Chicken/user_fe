import { Menu } from "@/type";
import { Image } from "expo-image";
import { Platform, ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { ArrowLeft, Heart, ChevronRight } from "lucide-react-native";

const PRODUCT_COLORS = [
  { bg: "#2e1005", border: "#c45a1a33", inner: "#d4631f", innerEnd: "#8a3008" },
  { bg: "#1a4a00", border: "#3b6d1133", inner: "#4aaa20", innerEnd: "#1a4a00" },
  { bg: "#05204a", border: "#185fa533", inner: "#2a7aee", innerEnd: "#05204a" },
  { bg: "#2a0530", border: "#99355633", inner: "#cc44aa", innerEnd: "#4a1528" },
];

function ProductIcon({ index }: { index: number }) {
  const color = PRODUCT_COLORS[index % PRODUCT_COLORS.length];
  return (
    <View
      style={{
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: "#1e1e1e", borderWidth: 1,
        borderColor: "#2e2e2e", alignItems: "center", justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 24, height: 24, borderRadius: 12,
          backgroundColor: color.inner,
        }}
      />
    </View>
  );
}

export function MenuDetails({ menu }: { menu: Menu }) {
  const router = useRouter();

  const baseUrl = Platform.OS === "web"
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;

  const totalSingoli = menu.menuProducts.reduce(
    (acc, p) => acc + p.unitPrice * p.quantity, 0
  );
  const risparmio = totalSingoli - menu.price;

  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View style={{ position: "relative", height: 220, backgroundColor: "#1a0a00", overflow: "hidden" }}>
          {menu.imgPath ? (
            <Image
              source={{ uri: `${baseUrl}/${menu.imgPath}?t=${menu.updatedAt}` }}
              style={{ width: "100%", height: 220 }}
              contentFit="cover"
              transition={300}
              onError={(e) => console.log("Image error:", e.error)}
            />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: "#2e1005", borderWidth: 2, borderColor: "#c45a1a33", alignItems: "center", justifyContent: "center" }}>
                <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: "#3a1a08", borderWidth: 2, borderColor: "#c45a1a55", alignItems: "center", justifyContent: "center" }}>
                  <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: "#c45a1a" }} />
                </View>
              </View>
            </View>
          )}

          {/* overlay bottom */}
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, backgroundColor: "transparent" }} />

          {/* back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: (Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 48) + 8,
              left: 16,
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: "rgba(0,0,0,0.6)",
              borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <ArrowLeft color="white" size={18} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 20 }}>

          {/* TITOLO + PREZZO */}
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10, paddingTop: 16, paddingBottom: 4 }}>
            <Text style={{ fontSize: 22, fontWeight: "500", color: "#f0e8df", flex: 1, lineHeight: 28 }}>
              {menu.name}
            </Text>
            <View style={{ backgroundColor: "rgba(196,90,26,0.2)", borderWidth: 1, borderColor: "rgba(196,90,26,0.4)", borderRadius: 10, padding: 8, alignItems: "flex-end" }}>
              <Text style={{ fontSize: 17, fontWeight: "500", color: "#c45a1a" }}>
                {menu.price.toFixed(2)}€
              </Text>
              {risparmio > 0 && (
                <Text style={{ fontSize: 9, color: "rgba(196,90,26,0.6)", marginTop: 1 }}>
                  risparmi {risparmio.toFixed(2)}€
                </Text>
              )}
            </View>
          </View>

          {/* DESCRIZIONE */}
          {menu.description && (
            <View style={{ backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#272727", borderRadius: 16, padding: 14, marginTop: 12, marginBottom: 18 }}>
              <Text style={{ fontSize: 9, fontWeight: "500", color: "#666", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 7 }}>
                Descrizione
              </Text>
              <Text style={{ fontSize: 12, color: "#999", lineHeight: 20 }}>
                {menu.description}
              </Text>
            </View>
          )}

          {/* PRODOTTI */}
          <Text style={{ fontSize: 9, fontWeight: "500", color: "#666", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>
            Prodotti inclusi
          </Text>

          {menu.menuProducts.map((product, index) => (
            <TouchableOpacity
              key={product.productId}
              onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.productId } })}
              style={{
                flexDirection: "row", alignItems: "center", gap: 12,
                backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#252525",
                borderRadius: 14, padding: 11, marginBottom: 8,
              }}
            >
              <ProductIcon index={index} />

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 12, fontWeight: "500", color: "#ddd", marginBottom: 3 }} numberOfLines={1}>
                  {product.productName}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 10, color: "#666" }}>x{product.quantity}</Text>
                  <View style={
                    product.obligatory
                      ? { backgroundColor: "rgba(196,90,26,0.15)", borderWidth: 1, borderColor: "rgba(196,90,26,0.2)", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 }
                      : { backgroundColor: "rgba(100,100,100,0.15)", borderWidth: 1, borderColor: "#2a2a2a", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 }
                  }>
                    <Text style={{ fontSize: 9, color: product.obligatory ? "rgba(196,90,26,0.8)" : "#666" }}>
                      {product.obligatory ? "obbligatorio" : "opzionale"}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={{ fontSize: 12, color: "#555", flexShrink: 0 }}>
                {product.unitPrice.toFixed(2)}€
              </Text>
              <ChevronRight color="#444" size={14} strokeWidth={1.5} />
            </TouchableOpacity>
          ))}

          {/* RIEPILOGO RISPARMIO */}
          {risparmio > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#272727", borderRadius: 12, padding: 10, paddingHorizontal: 14, marginTop: 4 }}>
              <Text style={{ fontSize: 11, color: "#666" }}>Totale singoli prodotti</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                <Text style={{ fontSize: 11, color: "#444", textDecorationLine: "line-through" }}>
                  {totalSingoli.toFixed(2)}€
                </Text>
                <Text style={{ fontSize: 11, color: "#4aaa20", fontWeight: "500" }}>
                  -{risparmio.toFixed(2)}€
                </Text>
              </View>
            </View>
          )}

        </View>
      </ScrollView>

      {/* CTA FISSA */}
      <View style={{ backgroundColor: "#141414", borderTopWidth: 1, borderTopColor: "#1e1e1e", padding: 16, paddingBottom: Platform.OS === "ios" ? 28 : 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TouchableOpacity
          style={{ width: 46, height: 46, borderRadius: 13, backgroundColor: "#1e1e1e", borderWidth: 1, borderColor: "#2a2a2a", alignItems: "center", justifyContent: "center" }}
        >
          <Heart color="#666" size={18} strokeWidth={1.5} />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "#c45a1a", borderRadius: 14, padding: 14, alignItems: "center" }}
        >
          <Text style={{ fontSize: 14, fontWeight: "500", color: "#fff" }}>
            Aggiungi al carrello
          </Text>
          <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
            {menu.price.toFixed(2)}€ · {menu.menuProducts.length} prodotti
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}