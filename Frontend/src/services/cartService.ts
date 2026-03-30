import { api } from './api';
import type { CartItem, CartSummary, AddToCartRequest } from '../types/cart';

export const cartService = {
    addToCart: async (
        sellerId: number,
        productId: number,
        quantity: number
    ): Promise<CartItem> => {
        return api.request<CartItem>(`/cart/add`, {
            method: 'POST',params:{sellerId},
            data: { productId, quantity },
        });
    },

    getCart: async (sellerId: number): Promise<CartSummary> => {
        return api.request<CartSummary>(`/cart?sellerId=${sellerId}`);
    },

    updateQuantity: async (
        sellerId: number,
        cartItemId: number,
        quantity: number
    ): Promise<CartItem> => {
        return api.request<CartItem>(
            `/cart/items/${cartItemId}`,
            { method: 'PUT',params :{sellerId,quantity} }
        );
    },

    removeItem: async (sellerId: number, cartItemId: number): Promise<void> => {
    return api.request<void>(
        `/cart/items/${cartItemId}`,
        { method: 'DELETE', params: { sellerId } }
    );
},

    clearCart: async (sellerId: number): Promise<{ message: string }> => {
        return api.request<{ message: string }>(
            `/cart/clear`,
            { method: 'DELETE',params:{sellerId} }
        );
    },

    getCartCount: async (sellerId: number): Promise<number> => {
        const response = await api.request<{ count: number }>(
            `/cart/count?sellerId=${sellerId}`
        );
        return response.count;
    },
};