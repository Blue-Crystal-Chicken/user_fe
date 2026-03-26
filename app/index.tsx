import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link, Stack, useRouter } from 'expo-router';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { useEffect } from 'react';
import { Image, type ImageStyle, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGO = {
  light: require('@/assets/images/logo_bcc.jpg'),
  dark: require('@/assets/images/logo_bcc.jpg'),
};

const SCREEN_OPTIONS = {
  title: 'Blue Crystal Chicken',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

export default function Screen() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        router.replace('/home');
      }
    };
    checkToken();
  }, []);

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 items-center justify-center gap-8 p-4">
        <View className="items-center gap-4">
          <Image source={LOGO[colorScheme ?? 'light']} style={IMAGE_STYLE} className="rounded-2xl" />
          <Text className="text-3xl font-bold text-foreground">Blue Crystal Chicken</Text>
          <Text className="text-muted-foreground text-center">Your favorite kitchen management app</Text>
        </View>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Login or create a new account to continue</CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <Link href="/register" asChild>
              <Button className="w-full">
                <Text>Register</Text>
              </Button>
            </Link>
            <Link href="/login" asChild>
              <Button variant="outline" className="w-full">
                <Text>Login</Text>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </View>
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}