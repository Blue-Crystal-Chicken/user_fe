import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Moon, Globe, Shield, CreditCard, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/components/context/AuthContext';

export function SettingsPage() {
  const router = useRouter();
  const backButtonTop = (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 48) + 12;
  const { notificationsEnabled, notificationsLoading, toggleNotifications } = useAuth();

  const [localSettings, setLocalSettings] = useState({
    darkMode: true,
    biometrics: false,
    analytics: true,
  });

  const toggleLocalSetting = (key: keyof typeof localSettings) => {
    setLocalSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    {
      title: 'PREFERENCES',
      items: [
        {
          key: 'notifications',
          title: 'Notifications',
          icon: Bell,
          type: 'switch' as const,
          value: notificationsEnabled,
          loading: notificationsLoading,
          onToggle: () => toggleNotifications(!notificationsEnabled),
        },
        {
          key: 'darkMode',
          title: 'Dark Mode',
          icon: Moon,
          type: 'switch' as const,
          value: localSettings.darkMode,
          loading: false,
          onToggle: () => toggleLocalSetting('darkMode'),
        },
        {
          title: 'Language',
          icon: Globe,
          type: 'link' as const,
          detail: 'English (US)',
          loading: false,
          onToggle: () => {},
        },
      ],
    },
    {
      title: 'SECURITY & PRIVACY',
      items: [
        {
          key: 'biometrics',
          title: 'Face ID / Touch ID',
          icon: Shield,
          type: 'switch' as const,
          value: localSettings.biometrics,
          loading: false,
          onToggle: () => toggleLocalSetting('biometrics'),
        },
        {
          title: 'Privacy Settings',
          icon: Shield,
          type: 'link' as const,
          loading: false,
          onToggle: () => {},
        },
        {
          key: 'analytics',
          title: 'Usage Analytics',
          icon: Shield,
          type: 'switch' as const,
          value: localSettings.analytics,
          loading: false,
          onToggle: () => toggleLocalSetting('analytics'),
        },
      ],
    },
    {
      title: 'PAYMENTS',
      items: [
        {
          title: 'Manage Subscriptions',
          icon: CreditCard,
          type: 'link' as const,
          loading: false,
          onToggle: () => {},
        },
      ],
    },
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
                    onPress={item.type === 'link' ? item.onToggle : undefined}
                    className={`p-5 flex-row items-center gap-4 ${iIndex !== section.items.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    <View className="w-10 h-10 rounded-2xl bg-[#1e2f5a] items-center justify-center">
                      <item.icon size={20} color="#4cc9f0" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-medium text-base">{item.title}</Text>
                    </View>

                    {item.type === 'switch' && (
                      item.loading ? (
                        <ActivityIndicator size="small" color="#4cc9f0" />
                      ) : (
                        <Switch
                          value={item.value as boolean}
                          onValueChange={item.onToggle}
                          trackColor={{ false: '#1e2f5a', true: '#4cc9f0' }}
                          thumbColor={item.value ? '#ffffff' : '#8ab4e0'}
                        />
                      )
                    )}

                    {item.type === 'link' && (
                      <View className="flex-row items-center gap-2">
                        {'detail' in item && item.detail ? (
                          <Text className="text-[#67b8e0] text-sm">{item.detail as string}</Text>
                        ) : null}
                        <ChevronRight size={18} color="#4cc9f0" />
                      </View>
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
