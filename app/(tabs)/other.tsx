import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserIcon, SettingsIcon, HelpCircleIcon, AccessibilityIcon } from 'lucide-react-native';

export default function OtherScreen() {
  const sections = [
    { title: 'Account', icon: UserIcon, description: 'Profile, orders, and addresses' },
    { title: 'Accessibility', icon: AccessibilityIcon, description: 'Adjust your experience' },
    { title: 'Help & Support', icon: HelpCircleIcon, description: 'FAQs and contact us' },
    { title: 'Settings', icon: SettingsIcon, description: 'App preferences' },
  ];

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold mb-6">Other Information</Text>
      
      <View className="gap-4">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader className="flex-row items-center gap-3">
              <section.icon className="text-primary size-6" />
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="text-muted-foreground">{section.description}</Text>
              <Text className="text-primary mt-2 font-medium">Coming soon (Demo)</Text>
            </CardContent>
          </Card>
        ))}
      </View>

      <View className="mt-8 mb-4 items-center">
        <Text className="text-muted-foreground text-xs">Version 1.0.0 (Beta)</Text>
      </View>
    </ScrollView>
  );
}
