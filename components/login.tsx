import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { View, Platform, ActivityIndicator } from 'react-native';
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from './context/AuthContext';
import { useColorScheme } from 'nativewind';

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
})

type LoginForm = z.infer<typeof loginSchema>

export function Login() {
    const router = useRouter();
    const { login } = useAuth();
    const { colorScheme } = useColorScheme();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        setError(null);
        const baseUrl = Platform.OS === 'web' ? process.env.EXPO_PUBLIC_API_URL_WEB : process.env.EXPO_PUBLIC_API_URL_MOBILE;

        try {
            const response = await fetch(`${baseUrl}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.text();
                setError(errorData || "Login failed");
                return;
            }

            const result = await response.json();
            login(result.token, result.user);
            router.replace("/home");
        } catch (err) {
            console.error("Login error:", err);
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent className="gap-4">
                <View className="gap-2">
                    <Label>Email</Label>
                    <Controller
                        control={form.control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="email@example.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                        )}
                    />
                    {form.formState.errors.email && <Text className="text-red-500 text-xs">{form.formState.errors.email.message}</Text>}
                </View>

                <View className="gap-2">
                    <Label>Password</Label>
                    <Controller
                        control={form.control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="********"
                                secureTextEntry
                                editable={!isLoading}
                            />
                        )}
                    />
                    {form.formState.errors.password && <Text className="text-red-500 text-xs">{form.formState.errors.password.message}</Text>}
                </View>

                {error && (
                    <View className="p-3 bg-red-100 dark:bg-red-900/30 rounded-md">
                        <Text className="text-red-600 dark:text-red-400 text-sm text-center">{error}</Text>
                    </View>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full flex-row gap-2"
                    onPress={form.handleSubmit(onSubmit)}
                    disabled={isLoading}
                >
                    {isLoading && <ActivityIndicator color={colorScheme === 'dark' ? "black" : "white"} />}
                    <Text className="font-bold">Login</Text>
                </Button>
            </CardFooter>
        </Card>
    );
}