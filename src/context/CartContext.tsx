import {createContext, ReactNode, useContext, useEffect, useState} from 'react'
import {CartItem} from "../types/CartItem.ts"
import {Product} from "../types/Product.ts"

type CartContextType = {
    cartItems: CartItem[]
    addToCart: (product: Product, quantity: number) => void
    removeFromCart: (productId: number) => void
    updateQuantity: (productId: number, newQuantity: number) => void
    clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({children}: { children: ReactNode })
{
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const storedCart = localStorage.getItem('cartItems')
        return storedCart ? JSON.parse(storedCart) : []
    })

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems))
    }, [cartItems])

    const addToCart = (product: Product, quantity: number) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.product.id === product.id)
            if (existing)
            {
                return prev.map(item =>
                    item.product.id === product.id
                        ? {...item, quantity: item.quantity + quantity}
                        : item
                )
            }
            return [...prev, {product, quantity}]
        })
    }

    const removeFromCart = (productId: number) => {
        setCartItems(prev => prev.filter(item => item.product.id !== productId))
    }

    const updateQuantity = (productId: number, newQuantity: number) => {
        setCartItems(prev =>
            prev.map(item =>
                item.product.id === productId
                    ? {...item, quantity: newQuantity}
                    : item
            )
        )
    }

    const clearCart = () => setCartItems([])

    return (
        <CartContext.Provider
            value={{cartItems, addToCart, removeFromCart, updateQuantity, clearCart}}
        >
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) throw new Error('useCart must be used within CartProvider')
    return context
}
