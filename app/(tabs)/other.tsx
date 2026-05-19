import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserIcon, SettingsIcon, HelpCircleIcon, AccessibilityIcon, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function OtherScreen() {
  const router = useRouter();

  const sections = [
    { 
      title: 'Account', 
      icon: UserIcon, 
      description: 'Profile, orders, and addresses',
      href: '/other/account' 
    },
    { 
      title: 'Accessibility', 
      icon: AccessibilityIcon, 
      description: 'Adjust your experience',
      href: '/other/accessibility' 
    },
    { 
      title: 'Help & Support', 
      icon: HelpCircleIcon, 
      description: 'FAQs and contact us',
      href: '/other/help' 
    },
    { 
      title: 'Settings', 
      icon: SettingsIcon, 
      description: 'App preferences',
      href: '/other/settings' 
    },
  ];

  return (
    <ScrollView className="flex-1 bg-background p-4" showsVerticalScrollIndicator={false}>
      <Text className="text-2xl font-bold mb-6">Other Information</Text>
      
      <View className="gap-4">
        {sections.map((section) => (
          <TouchableOpacity 
            key={section.title}
            onPress={() => router.push(section.href as any)}
            activeOpacity={0.7}
          >
            <Card className="border border-white/5 bg-[#121a2e]/50">
              <CardHeader className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <section.icon className="text-primary size-5" />
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </View>
                <ChevronRight size={18} className="text-muted-foreground/30" />
              </CardHeader>
              <CardContent>
                <Text className="text-muted-foreground text-sm">{section.description}</Text>
              </CardContent>
            </Card>
          </TouchableOpacity>
        ))}
      </View>


      <View className="mt-8 mb-4 items-center">
        <Text className="text-muted-foreground text-xs">Version 1.0.0 (Beta)</Text>
      </View>
    </ScrollView>
  );
}
