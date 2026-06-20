import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { ArrowLeft, Package, Clock, CreditCard, ChevronDown, ChevronUp, AlertCircle, ShoppingBag } from 'lucide-react-native';
import { useAuth } from '@/components/context/AuthContext';
import { Badge } from '@/components/ui/badge';

interface OrderItem {
  productId?: number;
  productName?: string;
  offerId?: number;
  offerName?: string;
  quantity: number;
  price: number;
  specialNote?: string;
}

interface Order {
  id: number;
  orderId: string;
  code: string;
  serviceType: string;
  orderType: string;
  tableNumber?: string;
  paymentType: string;
  paymentAmount: number;
  totalAt: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

export function OrdersPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({});

  const backButtonTop = (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 48) + 12;

  const baseUrl =
    Platform.OS === 'web'
      ? process.env.EXPO_PUBLIC_API_URL_WEB
      : process.env.EXPO_PUBLIC_API_URL_MOBILE;

  const fetchOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/api/orders/user/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data);
    } catch (err: any) {
      console.error('[OrdersPage] Fetch error:', err);
      setError('Impossibile caricare gli ordini. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const toggleExpand = (orderId: number) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getStatusBadge = (status: string) => {
    const normStatus = (status || '').toUpperCase();
    switch (normStatus) {
      case 'COMPLETED':
      case 'DELIVERED':
        return (
          <View className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <Text className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Completato</Text>
          </View>
        );
      case 'PREPARING':
      case 'COOKING':
        return (
          <View className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <Text className="text-amber-400 text-xs font-semibold uppercase tracking-wider">In Preparazione</Text>
          </View>
        );
      case 'PENDING':
        return (
          <View className="bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
            <Text className="text-sky-400 text-xs font-semibold uppercase tracking-wider">In Attesa</Text>
          </View>
        );
      case 'CANCELLED':
      case 'REJECTED':
        return (
          <View className="bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
            <Text className="text-rose-400 text-xs font-semibold uppercase tracking-wider">Annullato</Text>
          </View>
        );
      default:
        return (
          <View className="bg-slate-500/10 border border-slate-500/20 px-3 py-1 rounded-full">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{status}</Text>
          </View>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const getServiceTypeLabel = (type: string) => {
    const normType = (type || '').toUpperCase();
    switch (normType) {
      case 'DINE_IN':
        return 'Al tavolo';
      case 'TAKE_AWAY':
      case 'TAKEAWAY':
        return 'Asporto';
      case 'DELIVERY':
        return 'A domicilio';
      default:
        return type;
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const isExpanded = !!expandedOrders[item.id];
    const itemsSummary = item.items?.map((it) => `${it.quantity}x ${it.productName || it.offerName}`).join(', ') || 'Nessun prodotto';

    return (
      <View className="bg-[#121a2e] border border-white/5 rounded-3xl p-5 mb-4">
        {/* Card Header */}
        <TouchableOpacity
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
          className="flex-row justify-between items-start"
        >
          <View className="flex-1 pr-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-white text-lg font-bold">
                Ordine #{item.code || item.id}
              </Text>
              {item.tableNumber && (
                <View className="bg-[#1e2f5a] px-2 py-0.5 rounded-md">
                  <Text className="text-[#4cc9f0] text-xs font-semibold">{item.tableNumber}</Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center gap-2 mt-1">
              <Clock size={12} color="#8ab4e0" />
              <Text className="text-[#8ab4e0] text-xs">
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>
          <View className="items-end gap-2">
            {getStatusBadge(item.status)}
            <View className="flex-row items-center gap-1">
              <Text className="text-[#4cc9f0] text-sm font-semibold">
                € {item.totalAt?.toFixed(2) || item.paymentAmount?.toFixed(2) || '0.00'}
              </Text>
              {isExpanded ? (
                <ChevronUp size={16} color="#4cc9f0" />
              ) : (
                <ChevronDown size={16} color="#4cc9f0" />
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Collapsed view summary */}
        {!isExpanded && (
          <Text 
            numberOfLines={1} 
            className="text-slate-400 text-sm mt-3 pt-3 border-t border-white/5"
          >
            {itemsSummary}
          </Text>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <View className="mt-4 pt-4 border-t border-white/5 gap-3">
            {/* Products List */}
            <View className="gap-2">
              <Text className="text-[#67b8e0] text-xs font-bold uppercase tracking-wider">
                Prodotti ordinati
              </Text>
              {item.items?.map((prod, idx) => (
                <View key={idx} className="flex-row justify-between items-start py-1">
                  <View className="flex-1 pr-4">
                    <Text className="text-white text-sm font-medium">
                      {prod.quantity}x {prod.productName || prod.offerName}
                    </Text>
                    {prod.specialNote ? (
                      <Text className="text-amber-400 text-xs italic mt-0.5">
                        Nota: {prod.specialNote}
                      </Text>
                    ) : null}
                  </View>
                  <Text className="text-[#8ab4e0] text-sm">
                    € {(prod.price * prod.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Extra Info */}
            <View className="flex-row justify-between mt-2 pt-2 border-t border-white/5">
              <View className="flex-row items-center gap-1.5">
                <ShoppingBag size={14} color="#8ab4e0" />
                <Text className="text-[#8ab4e0] text-xs">
                  Servizio: {getServiceTypeLabel(item.serviceType)}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <CreditCard size={14} color="#8ab4e0" />
                <Text className="text-[#8ab4e0] text-xs">
                  Pagamento: {item.paymentType === 'cash' ? 'Contanti' : 'Carta'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#0a0f1c]">
      {/* Header */}
      <View className="relative h-40 justify-end pb-6 px-6 bg-[#0a0f1c]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute w-11 h-11 bg-white/10 border border-white/20 rounded-2xl items-center justify-center"
          style={{ top: backButtonTop, left: 16 }}
        >
          <ArrowLeft color="#e0f0ff" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="text-white text-3xl font-bold tracking-tight">I miei ordini</Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4cc9f0" />
            <Text className="text-[#8ab4e0] mt-3">Caricamento ordini...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center gap-4">
            <AlertCircle size={48} color="#ef4444" />
            <Text className="text-white text-center text-base">{error}</Text>
            <TouchableOpacity
              onPress={fetchOrders}
              className="bg-[#1e2f5a] border border-[#4cc9f066] px-6 py-3 rounded-full"
            >
              <Text className="text-[#4cc9f0] font-semibold">Riprova</Text>
            </TouchableOpacity>
          </View>
        ) : orders.length === 0 ? (
          <View className="flex-1 justify-center items-center gap-4">
            <Package size={64} color="#1e2f5a" />
            <Text className="text-white text-lg font-bold text-center">Nessun ordine trovato</Text>
            <Text className="text-[#8ab4e0] text-center text-sm px-8">
              Non hai ancora effettuato ordini. Quando lo farai, potrai visualizzarli in questa sezione.
            </Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        )}
      </View>
    </View>
  );
}
