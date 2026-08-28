import { formatPrice } from "@/features/products/utils/formatPrice";
import type { CartItem } from "../types/cart.types";
import { motion } from 'motion/react';
import { QuantityStepper } from "./QuantityStepper";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useEffect, useState } from "react";

interface CartItemRowProps {
    item: CartItem;
    disabled?: boolean;
    onQuantityChange: (quantity: number) => void;
}

export function CartItemRow({ item, disabled, onQuantityChange }: CartItemRowProps) {
    const [localQuantity, setLocalQuantity] = useState(item.quantity);
    const [prevServerQuantity, setPrevServerQuantity] = useState(item.quantity);

    // Sync local display if server value changes from elsewhere
    if (item.quantity !== prevServerQuantity) {
        setPrevServerQuantity(item.quantity);
        setLocalQuantity(item.quantity);
    }

    const debouncedQuantity = useDebounce(localQuantity, 1000);

    useEffect(() => {
        if (debouncedQuantity !== item.quantity)
            onQuantityChange(debouncedQuantity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedQuantity, item.quantity]);
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 rounded-2xl bg-surface-2
            p-3"
        >
            <img src={item.image} alt={item.name} className="h-16 w-16
            shrink-0 rounded-xl object-cover" />

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                    {item.name}
                </p>

                <p className="mt-1 text-sm font-semibold text-ink">
                    {formatPrice(item.price).full}
                </p>
            </div>

            <QuantityStepper 
                quantity={localQuantity}
                min={0}
                max={item.stock}
                disabled={disabled}
                onChange={setLocalQuantity}
            />
        </motion.div>
    );
}