import { api } from './api';
import type { CartItem, CartSummary, AddToCartRequest } from '../types/cart';

export const cartService = {
    // Add an item to the cart
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

    // Get the cart for a seller
    getCart: async (sellerId: number): Promise<CartSummary> => {
        return api.request<CartSummary>(`/cart?sellerId=${sellerId}`);
    },

    // Update quantity of a cart item
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

    // Remove an item from the cart
    removeItem: async (sellerId: number, cartItemId: number): Promise<void> => {
    return api.request<void>(
        `/cart/items/${cartItemId}`,
        { method: 'DELETE', params: { sellerId } }
    );
},

    // Clear the cart
    clearCart: async (sellerId: number): Promise<{ message: string }> => {
        return api.request<{ message: string }>(
            `/cart/clear?}`,
            { method: 'DELETE',params:{sellerId} }
        );
    },

    // Get cart count
    getCartCount: async (sellerId: number): Promise<number> => {
        const response = await api.request<{ count: number }>(
            `/cart/count?sellerId=${sellerId}`
        );
        return response.count;
    },
};