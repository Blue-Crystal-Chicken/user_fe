import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, StatusBar, Switch } from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { ArrowLeft, Type, Eye, Hand, MessageSquare } from 'lucide-react-native';

export function AccessibilityPage() {
  const router = useRouter();
  const backButtonTop = (Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 48) + 12;

  const [settings, setSettings] = useState({
    largeText: false,
    highContrast: false,
    screenReader: false,
    voiceCommands: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const options = [
    { key: 'largeText', title: 'Large Text', icon: Type, description: 'Increase the font size for better readability' },
    { key: 'highContrast', title: 'High Contrast', icon: Eye, description: 'Enhance visual contrast across the app' },
    { key: 'screenReader', title: 'Screen Reader Support', icon: Hand, description: 'Optimize layout for screen readers' },
    { key: 'voiceCommands', title: 'Voice Navigation', icon: MessageSquare, description: 'Control the app using voice commands' },
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
          <Text className="text-white text-3xl font-bold tracking-tight">Accessibility</Text>
        </View>

        <View className="px-6 py-4">
          <Text className="text-[#8ab4e0] text-base mb-8 leading-6">
            Customize your experience to make the app easier to use based on your needs.
          </Text>

          <View className="gap-4">
            {options.map((option) => (
              <View 
                key={option.key}
                className="bg-[#121a2e] border border-white/5 rounded-3xl p-5 flex-row items-center gap-4"
              >
                <View className="w-12 h-12 rounded-2xl bg-[#1e2f5a] items-center justify-center">
                  <option.icon size={22} color="#4cc9f0" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-medium text-base">{option.title}</Text>
                  <Text className="text-[#8ab4e0] text-xs mt-0.5">{option.description}</Text>
                </View>
                <Switch 
                  value={settings[option.key as keyof typeof settings]}
                  onValueChange={() => toggleSetting(option.key as keyof typeof settings)}
                  trackColor={{ false: '#1e2f5a', true: '#4cc9f0' }}
                  thumbColor={settings[option.key as keyof typeof settings] ? '#ffffff' : '#8ab4e0'}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
