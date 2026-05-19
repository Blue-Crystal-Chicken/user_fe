import React from 'react';
import { View, ScrollView, TouchableOpacity, Platform, StatusBar, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { ArrowLeft, HelpCircle, MessageCircle, Phone, Mail, Search, ChevronDown } from 'lucide-react-native';

export function HelpSupportPage() {
  const router = useRouter();
  const backButtonTop = (Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 48) + 12;

  const faqs = [
    { question: 'How do I track my order?', answer: 'You can track your order in the "My Orders" section of your account.' },
    { question: 'What is the refund policy?', answer: 'Refunds are processed within 3-5 business days of cancellation.' },
    { question: 'Can I change my delivery address?', answer: 'Yes, but only before the order has been prepared by the kitchen.' },
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
          <Text className="text-white text-3xl font-bold tracking-tight">Help & Support</Text>
        </View>

        <View className="px-6 py-6">
          {/* Search Bar */}
          <View className="bg-[#121a2e] border border-[#4cc9f033] rounded-2xl px-4 py-3 flex-row items-center gap-3 mb-8">
            <Search size={20} color="#8ab4e0" />
            <TextInput 
              placeholder="Search help topics..." 
              placeholderTextColor="#8ab4e0"
              className="flex-1 text-white text-base"
            />
          </View>

          {/* Contact Methods */}
          <Text className="text-[#67b8e0] text-xs font-medium uppercase tracking-[1.5px] ml-1 mb-4">
            CONTACT US
          </Text>
          <View className="flex-row gap-3 mb-10">
            <TouchableOpacity className="flex-1 bg-[#121a2e] border border-white/5 rounded-3xl p-5 items-center justify-center gap-2">
              <MessageCircle size={28} color="#4cc9f0" />
              <Text className="text-white font-medium">Live Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-[#121a2e] border border-white/5 rounded-3xl p-5 items-center justify-center gap-2">
              <Phone size={28} color="#4cc9f0" />
              <Text className="text-white font-medium">Call Support</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-[#121a2e] border border-white/5 rounded-3xl p-5 items-center justify-center gap-2">
              <Mail size={28} color="#4cc9f0" />
              <Text className="text-white font-medium">Email Us</Text>
            </TouchableOpacity>
          </View>

          {/* FAQS */}
          <Text className="text-[#67b8e0] text-xs font-medium uppercase tracking-[1.5px] ml-1 mb-4">
            FREQUENTLY ASKED QUESTIONS
          </Text>
          <View className="gap-3">
            {faqs.map((faq, index) => (
              <TouchableOpacity 
                key={index}
                className="bg-[#121a2e] border border-white/5 rounded-3xl p-5 gap-3"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-white font-medium text-base flex-1 pr-4">{faq.question}</Text>
                  <ChevronDown size={20} color="#8ab4e0" />
                </View>
                <Text className="text-[#8ab4e0] text-sm leading-5">{faq.answer}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
