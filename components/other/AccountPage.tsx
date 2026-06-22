import React from 'react';
import { View, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { ArrowLeft, User, CreditCard, MapPin, Package, LogOut, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/components/context/AuthContext';

export function AccountPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const backButtonTop = (Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 48) + 12;

  const menuItems: { title: string; icon: React.ComponentType<any>; description: string; route?: Href }[] = [
    { title: 'Personal Information', icon: User, description: 'Update your name and email', route: '/other/personal-info' as Href },
    { title: 'My Orders', icon: Package, description: 'Track and view past orders', route: '/other/orders' as Href },
    { title: 'Saved Addresses', icon: MapPin, description: 'Manage delivery locations', route: '/other/saved-addresses' as Href },
    { title: 'Payment Methods', icon: CreditCard, description: 'Manage your cards' },
  ];

  return (
    <View className="flex-1 bg-[#0a0f1c]">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View className="relative h-40 justify-end pb-6 px-6 bg-[#0a0f1c]">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute w-11 h-11 bg-white/10 border border-white/20 rounded-2xl items-center justify-center backdrop-blur-md"
            style={{ top: backButtonTop, left: 16 }}
          >
            <ArrowLeft color="#e0f0ff" size={24} strokeWidth={2.5} />
          </TouchableOpacity>
          
          <Text className="text-white text-3xl font-bold tracking-tight">Account</Text>
        </View>

        {/* User Profile Summary */}
        <View className="px-6 mb-8">
          <View className="bg-[#121a2e] border border-[#4cc9f033] rounded-[32px] p-6 flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-full bg-[#1e2f5a] items-center justify-center border border-[#4cc9f066]">
              <User size={32} color="#4cc9f0" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-semibold">{user?.name || 'Guest User'}</Text>
              <Text className="text-[#8ab4e0] text-sm">{user?.email || 'Login to manage your account'}</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-6 gap-4">
          <Text className="text-[#67b8e0] text-xs font-medium uppercase tracking-[1.5px] ml-1 mb-2">
            MANAGEMENT
          </Text>
          
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => item.route && router.push(item.route)}
              className="bg-[#121a2e] border border-white/5 rounded-3xl p-5 flex-row items-center gap-4"
            >
              <View className="w-12 h-12 rounded-2xl bg-[#1e2f5a] items-center justify-center">
                <item.icon size={22} color="#4cc9f0" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium text-base">{item.title}</Text>
                <Text className="text-[#8ab4e0] text-xs mt-0.5">{item.description}</Text>
              </View>
              <ChevronRight size={20} color="#1e2f5a" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View className="px-6 mt-10 mb-12">
          <TouchableOpacity 
            onPress={logout}
            className="bg-red-500/10 border border-red-500/20 rounded-3xl p-5 flex-row items-center justify-center gap-3"
          >
            <LogOut size={20} color="#ef4444" />
            <Text className="text-red-500 font-semibold text-base">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
