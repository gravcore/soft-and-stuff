import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addCartItem, clearCart, fetchCart, removeCartItem, updateCartItem } from "../services/cartApi";

const CART_KEY = ['cart'] as const;

export const useCart = () => {
    const queryClient = useQueryClient();
    const cartQuery = useQuery({ queryKey: CART_KEY, queryFn: fetchCart });

    const onMutate = (data: Awaited<ReturnType<typeof fetchCart>>) => 
        queryClient.setQueryData(CART_KEY, data);
    
    const addItem = useMutation({
        mutationFn: ({ productId, quantity }: { productId: string; quantity: number; }) =>
            addCartItem(productId, quantity),
        onSuccess: onMutate,
    });

    const updateItem = useMutation({
        mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
            updateCartItem(itemId, quantity),
        onSuccess: onMutate,
    });

    const removeItem = useMutation({
        mutationFn: (itemId: string) => removeCartItem(itemId),
        onSuccess: onMutate,
    });

    const clearAllCart = useMutation({
        mutationFn: clearCart,
        onSuccess: onMutate,
    });

    return {
        cart: cartQuery.data,
        isLoading: cartQuery.isLoading,
        addItem, updateItem, removeItem, clearAllCart,
    }
}