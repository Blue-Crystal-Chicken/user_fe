import React, { useState } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Save } from 'lucide-react-native';
import { useAuth } from '@/components/context/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useColorScheme } from 'nativewind';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Option,
} from '@/components/ui/select';
import { UserUpdateRequest } from '@/type';

const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
] as const;

const userUpdateSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    surname: z.string().min(3, 'Surname must be at least 3 characters long'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone is required'),
    gender: z.string().min(1, 'Gender is required'),
    birthday: z.string().min(10, 'Birthday must be at least 10 characters long'),
});

type UserUpdateForm = z.infer<typeof userUpdateSchema>;

export function PersonalInfoPage() {
    const router = useRouter();
    const { user, token, login } = useAuth();
    const { colorScheme } = useColorScheme();
    const [isLoading, setIsLoading] = useState(false);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const backButtonTop = (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 48) + 12;

    const baseUrl =
        Platform.OS === 'web'
            ? process.env.EXPO_PUBLIC_API_URL_WEB
            : process.env.EXPO_PUBLIC_API_URL_MOBILE;

    const form = useForm<UserUpdateForm>({
        resolver: zodResolver(userUpdateSchema),
        defaultValues: {
            name: user?.name ?? '',
            surname: user?.surname ?? '',
            email: user?.email ?? '',
            phone: user?.phone ?? '',
            gender: (user?.gender ?? '').toLowerCase(),
            birthday: user?.birthday ?? '',
        },
    });

    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);

    const handleConfirm = (date: Date, onChange: (value: string) => void) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        onChange(`${year}-${month}-${day}`);
        hideDatePicker();
    };

    const onSubmit = async (data: UserUpdateForm) => {
        if (!user || !token) return;
        setIsLoading(true);
        try {
            const body: UserUpdateRequest = {
                name: data.name,
                surname: data.surname,
                email: data.email,
                phone: data.phone,
                gender: data.gender,
                birthday: data.birthday,
            };

            const response = await fetch(`${baseUrl}/api/users/v1/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                alert(`Error: ${errorText}`);
                return;
            }

            const updatedUser = await response.json();
            // Aggiorna il contesto con i nuovi dati (token invariato)
            login(token, updatedUser);
            router.back();
        } catch (e) {
            console.error('[PersonalInfo] Update error:', e);
            alert('Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-[#0a0f1c]">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View className="relative h-40 justify-end pb-6 px-6 bg-[#0a0f1c]">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute w-11 h-11 bg-white/10 border border-white/20 rounded-2xl items-center justify-center"
                        style={{ top: backButtonTop, left: 16 }}
                    >
                        <ArrowLeft color="#e0f0ff" size={24} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <Text className="text-white text-3xl font-bold tracking-tight">
                        Personal Info
                    </Text>
                </View>

                {/* Avatar card */}
                <View className="px-6 mb-8">
                    <View className="bg-[#121a2e] border border-[#4cc9f033] rounded-[32px] p-6 flex-row items-center gap-4">
                        <View className="w-16 h-16 rounded-full bg-[#1e2f5a] items-center justify-center border border-[#4cc9f066]">
                            <User size={32} color="#4cc9f0" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white text-xl font-semibold">
                                {user?.name} {user?.surname}
                            </Text>
                            <Text className="text-[#8ab4e0] text-sm">{user?.email}</Text>
                        </View>
                    </View>
                </View>

                {/* Form */}
                <View className="px-6 gap-5">
                    <Text className="text-[#67b8e0] text-xs font-medium uppercase tracking-[1.5px] ml-1">
                        EDIT INFORMATION
                    </Text>

                    {/* Name */}
                    <View className="gap-2">
                        <Label>Name</Label>
                        <Controller
                            control={form.control}
                            name="name"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="Enter your name"
                                    editable={!isLoading}
                                    aria-invalid={!!form.formState.errors.name}
                                />
                            )}
                        />
                        {form.formState.errors.name && (
                            <Text className="text-red-500 text-xs">
                                {form.formState.errors.name.message}
                            </Text>
                        )}
                    </View>

                    {/* Surname */}
                    <View className="gap-2">
                        <Label>Surname</Label>
                        <Controller
                            control={form.control}
                            name="surname"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="Enter your surname"
                                    editable={!isLoading}
                                    aria-invalid={!!form.formState.errors.surname}
                                />
                            )}
                        />
                        {form.formState.errors.surname && (
                            <Text className="text-red-500 text-xs">
                                {form.formState.errors.surname.message}
                            </Text>
                        )}
                    </View>

                    {/* Email */}
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
                                    aria-invalid={!!form.formState.errors.email}
                                />
                            )}
                        />
                        {form.formState.errors.email && (
                            <Text className="text-red-500 text-xs">
                                {form.formState.errors.email.message}
                            </Text>
                        )}
                    </View>

                    {/* Phone */}
                    <View className="gap-2">
                        <Label>Phone</Label>
                        <Controller
                            control={form.control}
                            name="phone"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="Phone number"
                                    keyboardType="phone-pad"
                                    editable={!isLoading}
                                    aria-invalid={!!form.formState.errors.phone}
                                />
                            )}
                        />
                        {form.formState.errors.phone && (
                            <Text className="text-red-500 text-xs">
                                {form.formState.errors.phone.message}
                            </Text>
                        )}
                    </View>

                    {/* Gender */}
                    <View className="gap-2">
                        <Label>Gender</Label>
                        <Controller
                            control={form.control}
                            name="gender"
                            render={({ field: { onChange, value } }) => {
                                const selectedOption = GENDER_OPTIONS.find(
                                    (opt) => opt.value === value,
                                );
                                return (
                                    <Select
                                        value={selectedOption as Option | undefined}
                                        onValueChange={(option) => {
                                            if (option) onChange(option.value);
                                        }}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {GENDER_OPTIONS.map((opt) => (
                                                    <SelectItem
                                                        key={opt.value}
                                                        value={opt.value}
                                                        label={opt.label}
                                                    >
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                );
                            }}
                        />
                        {form.formState.errors.gender && (
                            <Text className="text-red-500 text-xs">
                                {form.formState.errors.gender.message}
                            </Text>
                        )}
                    </View>

                    {/* Birthday */}
                    <View className="gap-2">
                        <Label>Birthday</Label>
                        <Controller
                            control={form.control}
                            name="birthday"
                            render={({ field: { onChange, value } }) => (
                                <View>
                                    {Platform.OS === 'web' ? (
                                        <input
                                            type="date"
                                            value={value}
                                            onChange={(e) => onChange(e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
                                            style={{
                                                width: '100%',
                                                height: 40,
                                                padding: '0 12px',
                                                borderRadius: 6,
                                                border: '1px solid #e2e8f0',
                                                backgroundColor: 'transparent',
                                                color: colorScheme === 'dark' ? '#f8fafc' : '#0f172a',
                                                fontSize: 16,
                                                outline: 'none',
                                            }}
                                        />
                                    ) : (
                                        <>
                                            <Pressable onPress={showDatePicker} disabled={isLoading}>
                                                <View pointerEvents="none">
                                                    <Input
                                                        value={value}
                                                        placeholder="YYYY-MM-DD"
                                                        editable={false}
                                                        aria-invalid={!!form.formState.errors.birthday}
                                                    />
                                                </View>
                                            </Pressable>
                                            <DateTimePickerModal
                                                isVisible={isDatePickerVisible}
                                                mode="date"
                                                onConfirm={(date) => handleConfirm(date, onChange)}
                                                onCancel={hideDatePicker}
                                                maximumDate={new Date()}
                                            />
                                        </>
                                    )}
                                </View>
                            )}
                        />
                        {form.formState.errors.birthday && (
                            <Text className="text-red-500 text-xs">
                                {form.formState.errors.birthday.message}
                            </Text>
                        )}
                    </View>

                    {/* Save Button */}
                    <View className="mt-4 mb-12">
                        <Button
                            className="w-full flex-row gap-2"
                            onPress={form.handleSubmit(onSubmit)}
                            disabled={isLoading}
                            style={{ opacity: isLoading ? 0.7 : 1 }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colorScheme === 'dark' ? 'black' : 'white'} />
                            ) : (
                                <Save size={18} color={colorScheme === 'dark' ? 'black' : 'white'} />
                            )}
                            <Text className="font-bold">
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </Text>
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
