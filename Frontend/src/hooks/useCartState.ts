import { useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { useConfirm } from '../context/ConfirmContext';

interface CartItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    total: number;
    wholesalerId: number;
    wholesalerName: string;
}

export function useCartState(sellerId: number | undefined) {
    const { confirm } = useConfirm();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartItemIds, setCartItemIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);

    const loadCart = useCallback(async () => {
        if (!sellerId) {
            setLoading(false);
            return;
        }

        try {
            const cart = await cartService.getCart(sellerId);
            setCartItems(cart.items || []);
            setCartItemIds(new Set((cart.items || []).map(item => item.productId)));
            setCartCount(cart.totalItems || 0);
        } catch (err) {
            console.error('Failed to load cart:', err);
        } finally {
            setLoading(false);
        }
    }, [sellerId]);

    const handleAdd = async () => {
        const ok = await confirm(
            "Your cart has items from another wholesaler. Clear cart?",
            "warning"
        );

        if (!ok) return;
    }

    const addToCart = async (productId: number, quantity: number = 1, wholesalerId?: number) => {
        if (!sellerId) return false;
        try {
            const currentCart = await cartService.getCart(sellerId);
            if (currentCart.items.length > 0) {
                const existingWholesalerId = currentCart.items[0].wholesalerId;

                if (wholesalerId && existingWholesalerId !== wholesalerId) {
                    handleAdd();
                    return false;
                }
            }

            await cartService.addToCart(sellerId, productId, quantity);
            await loadCart();
            return true;
        } catch (err) {
            console.error('Failed to add to cart:', err);
            return false;
        }
    };

    const removeFromCart = async (cartItemId: number) => {
        if (!sellerId) return false;
        try {
            await cartService.removeItem(sellerId, cartItemId);
            await loadCart();
            return true;
        } catch (err) {
            console.error('Failed to remove from cart:', err);
            return false;
        }
    };

    const isInCart = (productId: number) => cartItemIds.has(productId);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    return {
        cartItems,
        cartCount,
        loading,
        isInCart,
        addToCart,
        removeFromCart,
        refreshCart: loadCart
    };
}