import { AnimatePresence } from "motion/react";
import type { CartItem } from "../types/cart.types";
import { CartItemRow } from "./CartItemRow";

interface CartItemListProps {
    items: CartItem[];
    disabled?: boolean;
    onQuantityChange: (itemId: string, quantity: number) => void;
}

export function CartItemList({ items, disabled, onQuantityChange }: CartItemListProps) {
    return (
        <div className="space-y-3">
            <AnimatePresence initial={false}>
                {items.map((item) => (
                    <CartItemRow
                        key={item.id}
                        item={item}
                        disabled={disabled}
                        onQuantityChange={(quantity) => onQuantityChange(item.id, quantity)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}