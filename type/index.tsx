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

export interface UserUpdateRequest {
    name: string;
    surname: string;
    email: string;
    phone: string;
    gender: string;
    birthday: string;
}

export interface Category{
    id: string;
    name: string;
}

export interface Ingredient{
    id: string;
    name: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    category: Category;
    size: string;
    quantity: number;
    weight?: number;           
    liters?: number;          
    additions: number;
    price: number;
    nutritionalInfo: string;
    calories?: number;     
    isSpicy?: boolean;
    flavor?: string;
    temperature?: string;
    isCarbonated?: boolean;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    imgPath?: string;
    ingredients: Ingredient[];
    isFavorite?: boolean;
    updatedAt: string;
}


export interface Location{
    city: string;
    isOpen: boolean;
}

export interface MenuProduct {
    productId: string;
    productName: string;
    quantity: number;
    obligatory: boolean;
    unitPrice: number;
}

export interface Menu {
    id: string;
    name: string;
    description: string;
    price: number;
    imgPath?: string;
    menuProducts: MenuProduct[];
    isFavorite?: boolean;
    updatedAt: string;
}

export interface OfferProduct {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
}

export interface Offer {
    id: string;
    name: string;
    description: string;
    price: number;
    imgPath?: string;
    offerProducts: OfferProduct[];
    menus: Menu[];
    updatedAt: string;
}

