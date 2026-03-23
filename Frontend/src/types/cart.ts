
export interface CartItem { 
    id: number; 
    productId: number; 
    productName: string; 
    productImage?: string; 
    quantity: number; 
    price: number; 
    total: number; 
    wholesalerId: number; 
    wholesalerName: string; 
    availableStock: number; 
}

export interface CartSummary { 
    items: CartItem[]; 
    totalItems: number; 
    subtotal: number; 
    taxAmount: number; 
    totalAmount: number; 
    wholesalerGroups: Record<number, string>; 
}

export interface AddToCartRequest { 
    productId: number; 
    quantity: number; 
}

