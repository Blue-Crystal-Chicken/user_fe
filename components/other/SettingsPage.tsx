import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, StatusBar, Switch } from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Moon, Globe, Shield, CreditCard, ChevronRight } from 'lucide-react-native';

export function SettingsPage() {
  const router = useRouter();
  const backButtonTop = (Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 48) + 12;

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    biometrics: false,
    analytics: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    {
      title: 'PREFERENCES',
      items: [
        { key: 'notifications', title: 'Notifications', icon: Bell, type: 'switch', value: settings.notifications },
        { key: 'darkMode', title: 'Dark Mode', icon: Moon, type: 'switch', value: settings.darkMode },
        { title: 'Language', icon: Globe, type: 'link', detail: 'English (US)' },
      ]
    },
    {
      title: 'SECURITY & PRIVACY',
      items: [
        { key: 'biometrics', title: 'Face ID / Touch ID', icon: Shield, type: 'switch', value: settings.biometrics },
        { title: 'Privacy Settings', icon: Shield, type: 'link' },
        { key: 'analytics', title: 'Usage Analytics', icon: Shield, type: 'switch', value: settings.analytics },
      ]
    },
    {
      title: 'PAYMENTS',
      items: [
        { title: 'Manage Subscriptions', icon: CreditCard, type: 'link' },
      ]
    }
  ];

  return (
    <View className="flex-1 bg-[#0a0f1c]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="relative h-40 justify-end pb-6 px-6 bg-[#0a0f1c]">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute w-11 h-11 bg-white/10 border border-white/20 rounded-2xl items-center justify-center backdrop-blur-md"
            style={{ top: backButtonTop, left: 16 }}
          >
            <ArrowLeft color="#e0f0ff" size={24} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold tracking-tight">Settings</Text>
        </View>

        <View className="px-6 py-6 pb-12 gap-10">
          {sections.map((section, sIndex) => (
            <View key={sIndex} className="gap-4">
              <Text className="text-[#67b8e0] text-xs font-medium uppercase tracking-[1.5px] ml-1">
                {section.title}
              </Text>
              
              <View className="bg-[#121a2e] border border-white/5 rounded-[32px] overflow-hidden">
                {section.items.map((item, iIndex) => (
                  <TouchableOpacity 
                    key={iIndex}
                    activeOpacity={item.type === 'switch' ? 1 : 0.7}
                    className={`p-5 flex-row items-center gap-4 ${iIndex !== section.items.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    <View className="w-10 h-10 rounded-2xl bg-[#1e2f5a] items-center justify-center">
                      <item.icon size={20} color="#4cc9f0" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-medium text-base">{item.title}</Text>
                    </View>
                    {item.type === 'switch' && (
                      <Switch 
                        value={item.value as boolean}
                        onValueChange={() => toggleSetting(item.key as keyof typeof settings)}
                        trackColor={{ false: '#1e2f5a', true: '#4cc9f0' }}
                        thumbColor={item.value ? '#ffffff' : '#8ab4e0'}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
