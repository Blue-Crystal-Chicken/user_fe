export interface User {
    id: string;
    name: string;
    surname: string;
    birthday: string;
    email: string;
    password: string;
    gender: string;
    phone: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserLogin {
    email: string;
    password: string;
}

export interface Category{
    id: string;
    name: string;
}

export interface Ingredient{
    id: string;
    name: string;
}

export interface Product{
    id: string;
    name: string;
    description: string;
    price: number;
    img_path: string;
    category: Category;
    size: string;
    quantity: number;
    additions: number;
    nutritionalInfo: string;
    ingredients: Ingredient[];
    updatedAt: string;
}