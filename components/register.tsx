import { View, Platform, Pressable, ActivityIndicator } from "react-native";
import { Text } from "./ui/text";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Icon } from "./ui/icon";
import { useAuth } from "./context/AuthContext";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Option
} from "@/components/ui/select"


const GENDER_OPTIONS = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" }
] as const;


const userRegister = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    surname: z.string().min(3, "Surname must be at least 3 characters long"),
    birthday: z.string().min(10, "Birthday must be at least 10 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    gender: z.string().min(1, "Gender is required"),
    phone: z.string().min(1, "Phone is required"),
    role: z.string().min(1, "Role is required"),
})

type UserRegister = z.infer<typeof userRegister>

export default function Register() {
    const router = useRouter();
    const { login } = useAuth();
    const { colorScheme } = useColorScheme();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const userRegisterForm = useForm<UserRegister>({
        resolver: zodResolver(userRegister),
        defaultValues: {
            name: "",
            surname: "",
            birthday: "",
            email: "",
            password: "",
            gender: "",
            phone: "",
            role: "USER"
        }
    })

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date: Date, onChange: (value: string) => void) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        onChange(formattedDate);
        hideDatePicker();
    };

    const nextStep = async () => {
        let fieldsToValidate: (keyof UserRegister)[] = [];
        if (currentStep === 1) fieldsToValidate = ["name", "surname"];
        else if (currentStep === 2) fieldsToValidate = ["email", "password"];
        
        const isValid = await userRegisterForm.trigger(fieldsToValidate);
        if (isValid) {
            setIsLoading(true);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setIsLoading(false);
            }, 500);
        }
    };

    const prevStep = () => {
        if (currentStep === 1) {
            router.back();
        } else {
            setCurrentStep(prev => prev - 1);
        }
    };

    const onSubmit = async (data: UserRegister) => {
        setIsLoading(true);
        console.log("onSubmit triggered with data:", data); 
        const baseUrl = Platform.OS === 'web' ? process.env.EXPO_PUBLIC_API_URL_WEB : process.env.EXPO_PUBLIC_API_URL_MOBILE;
        data.role = "USER";
        console.log("onSubmit triggered with data:", data); 
        try {
            const response = await fetch(`${baseUrl}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                const errorData = await response.text();
                alert(`Server error: ${errorData}`);
                return;
            }

            const result = await response.json();
            console.log("Success:", result);
            login(result.token, result);
            router.replace("/home");
        } catch (error) {
            console.error("Network error:", error);
            alert("Network error. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="flex-row items-center gap-2">
                <Button variant="ghost" size="icon" onPress={prevStep} disabled={isLoading}>
                    <Icon as={ChevronLeft} size={20} className="text-foreground" />
                </Button>
                <View className="flex-1 gap-1.5">
                    <CardTitle>
                        {currentStep === 1 ? "Personal Info" : 
                         currentStep === 2 ? "Account Security" : "Additional Info"}
                    </CardTitle>
                    <CardDescription>
                        {currentStep === 1 ? "Enter your name and surname" : 
                         currentStep === 2 ? "Provide your email and password" : "Final details for your profile"}
                    </CardDescription>
                </View>
            </CardHeader>
            <CardContent>
                <View className="w-full justify-center gap-4">
                    {currentStep === 1 && (
                        <View className="gap-4">
                            <View className="gap-2">
                                <Label>Name</Label>
                                <Controller
                                    control={userRegisterForm.control}
                                    name="name"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <Input
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Enter your name"
                                            editable={!isLoading}
                                            aria-invalid={!!userRegisterForm.formState.errors.name}
                                        />
                                    )}
                                />
                                {userRegisterForm.formState.errors.name && <Text className="text-red-500 text-xs">{userRegisterForm.formState.errors.name.message}</Text>}
                            </View>

                            <View className="gap-2">
                                <Label>Surname</Label>
                                <Controller
                                    control={userRegisterForm.control}
                                    name="surname"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <Input
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Enter your surname"
                                            editable={!isLoading}
                                            aria-invalid={!!userRegisterForm.formState.errors.surname}
                                        />
                                    )}
                                />
                                {userRegisterForm.formState.errors.surname && <Text className="text-red-500 text-xs">{userRegisterForm.formState.errors.surname.message}</Text>}
                            </View>
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View className="gap-4">
                            <View className="gap-2">
                                <Label>Email</Label>
                                <Controller
                                    control={userRegisterForm.control}
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
                                            aria-invalid={!!userRegisterForm.formState.errors.email}
                                        />
                                    )}
                                />
                                {userRegisterForm.formState.errors.email && <Text className="text-red-500 text-xs">{userRegisterForm.formState.errors.email.message}</Text>}
                            </View>

                            <View className="gap-2">
                                <Label>Password</Label>
                                <Controller
                                    control={userRegisterForm.control}
                                    name="password"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <Input
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Min 6 characters"
                                            secureTextEntry
                                            editable={!isLoading}
                                            aria-invalid={!!userRegisterForm.formState.errors.password}
                                        />
                                    )}
                                />
                                {userRegisterForm.formState.errors.password && <Text className="text-red-500 text-xs">{userRegisterForm.formState.errors.password.message}</Text>}
                            </View>
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View className="gap-4">
                            <View className="gap-2">
                                <Label>Birthday</Label>
                                <Controller
                                    control={userRegisterForm.control}
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
                                                        outline: 'none'
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
                                                                aria-invalid={!!userRegisterForm.formState.errors.birthday}
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
                                {userRegisterForm.formState.errors.birthday && <Text className="text-red-500 text-xs">{userRegisterForm.formState.errors.birthday.message}</Text>}
                            </View>

                            <View className="gap-2">
                                <Label>Gender</Label>
                                <Controller
                                    control={userRegisterForm.control}
                                    name="gender"
                                    render={({ field: { onChange, value } }) => {
                                        const selectedOption = GENDER_OPTIONS.find(opt => opt.value === value);
                                        return (
                                            <Select 
                                                value={selectedOption as Option | undefined} 
                                                onValueChange={(option) => {
                                                    if (option) {
                                                        onChange(option.value);
                                                    }
                                                }}
                                                disabled={isLoading}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {GENDER_OPTIONS.map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value} label={opt.label}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        )
                                    }}
                                />
                                {userRegisterForm.formState.errors.gender && (
                                    <Text className="text-red-500 text-xs">
                                        {userRegisterForm.formState.errors.gender.message}
                                    </Text>
                                )}
                            </View>

                            <View className="gap-2">
                                <Label>Phone</Label>
                                <Controller
                                    control={userRegisterForm.control}
                                    name="phone"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <Input
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Phone number"
                                            keyboardType="phone-pad"
                                            editable={!isLoading}
                                            aria-invalid={!!userRegisterForm.formState.errors.phone}
                                        />
                                    )}
                                />
                                {userRegisterForm.formState.errors.phone && <Text className="text-red-500 text-xs">{userRegisterForm.formState.errors.phone.message}</Text>}
                            </View>
                        </View>
                    )}
                </View>
            </CardContent>
            {currentStep > 0 && (
                <CardFooter className="flex-col gap-2">
                    <Button 
                        className="w-full flex-row gap-2" 
                        onPress={currentStep === 3 ? userRegisterForm.handleSubmit(onSubmit) : nextStep}
                        disabled={isLoading}
                        style={{ opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading && <ActivityIndicator color={colorScheme === 'dark' ? "black" : "white"} />}
                        <Text className="font-bold">
                            {currentStep === 3 ? "Register" : "Next"}
                        </Text>
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}