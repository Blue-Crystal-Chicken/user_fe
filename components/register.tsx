import { Text, View } from "react-native";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";


const userRegister = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    surname: z.string().min(3, "Surname must be at least 3 characters long"),
    birthday: z.string().min(10, "Birthday must be at least 10 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    gender: z.string().min(1, "Gender is required"),
    phone: z.string().min(1, "Phone is required")
})

type UserRegister = z.infer<typeof userRegister>

export default function Register() {

    const userRegisterForm = useForm<UserRegister>({
        resolver: zodResolver(userRegister),
        defaultValues: {
            name: "",
            surname: "",
            birthday: "",
            email: "",
            password: "",
            gender: "",
            phone: ""
        }
    })

    const onSubmit = async (data: UserRegister) => {
        console.log(data);
        try {
            const response = await fetch("http://localhost:8080/api/users/v1/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            console.log(result);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="flex-row">
                <View className="flex-1 gap-1.5">
                    <CardTitle>Subscribe to our newsletter</CardTitle>
                    <CardDescription>Enter your details to receive updates and tips</CardDescription>
                </View>
            </CardHeader>
            <CardContent>
                <View className="w-full justify-center gap-4">
                    <form onSubmit={userRegisterForm.handleSubmit(onSubmit)}>
                    <View className="gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input {...userRegisterForm.register("name")} aria-invalid={userRegisterForm.formState.errors.name ? true : false} aria-describedby={userRegisterForm.formState.errors.name ? "name-error" : undefined}/>
                        {userRegisterForm.formState.errors.name && <Text id="name-error" className="text-red-500">{userRegisterForm.formState.errors.name.message}</Text>}
                    </View>
                    <View className="gap-2">
                        <Label htmlFor="surname">Surname</Label>
                        <Input {...userRegisterForm.register("surname")} aria-invalid={userRegisterForm.formState.errors.surname ? true : false} aria-describedby={userRegisterForm.formState.errors.surname ? "surname-error" : undefined}/>
                        {userRegisterForm.formState.errors.surname && <Text id="surname-error" className="text-red-500">{userRegisterForm.formState.errors.surname.message}</Text>}
                    </View>
                    <View className="gap-2">
                        <Label htmlFor="birthday">Birthday</Label>
                        <Input {...userRegisterForm.register("birthday")} aria-invalid={userRegisterForm.formState.errors.birthday ? true : false} aria-describedby={userRegisterForm.formState.errors.birthday ? "birthday-error" : undefined}/>
                        {userRegisterForm.formState.errors.birthday && <Text id="birthday-error" className="text-red-500">{userRegisterForm.formState.errors.birthday.message}</Text>}
                    </View>
                    <View className="gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input {...userRegisterForm.register("email")} aria-invalid={userRegisterForm.formState.errors.email ? true : false} aria-describedby={userRegisterForm.formState.errors.email ? "email-error" : undefined}/>
                        {userRegisterForm.formState.errors.email && <Text id="email-error" className="text-red-500">{userRegisterForm.formState.errors.email.message}</Text>}
                    </View>
                    <View className="gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input {...userRegisterForm.register("password")} aria-invalid={userRegisterForm.formState.errors.password ? true : false} aria-describedby={userRegisterForm.formState.errors.password ? "password-error" : undefined}/>
                        {userRegisterForm.formState.errors.password && <Text id="password-error" className="text-red-500">{userRegisterForm.formState.errors.password.message}</Text>}
                    </View>
                    <View className="gap-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Input {...userRegisterForm.register("gender")} aria-invalid={userRegisterForm.formState.errors.gender ? true : false} aria-describedby={userRegisterForm.formState.errors.gender ? "gender-error" : undefined}/>
                        {userRegisterForm.formState.errors.gender && <Text id="gender-error" className="text-red-500">{userRegisterForm.formState.errors.gender.message}</Text>}
                    </View>
                    <View className="gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input {...userRegisterForm.register("phone")} aria-invalid={userRegisterForm.formState.errors.phone ? true : false} aria-describedby={userRegisterForm.formState.errors.phone ? "phone-error" : undefined}/>
                        {userRegisterForm.formState.errors.phone && <Text id="phone-error" className="text-red-500">{userRegisterForm.formState.errors.phone.message}</Text>}
                    </View>
                    </form>
                </View>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button className="w-full" onPress={userRegisterForm.handleSubmit(onSubmit)}>
                    <Text>Sign-up</Text>
                </Button>
                <Button variant="outline" className="w-full">
                    <Text>Login</Text>
                </Button>
            </CardFooter>
        </Card>
    );
}