import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import Hero from '@/components/hero';

export default function HomeScreen() {
  return (
    <View>
      <Hero title={"Blue Crystal Chicken"} subtitle={"Your favorite fast food ordering app!"}/>
    </View>
  );
}
