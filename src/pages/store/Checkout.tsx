import {useState} from 'react'
import {useCart} from '../../context/CartContext'
import {useNavigate} from 'react-router-dom'

export default function Checkout() {
    const {cartItems, clearCart} = useCart()
    const navigate = useNavigate()
    const [shippingInfo, setShippingInfo] = useState({
        address: '',
        notes: ''
    })

    const handleSubmit = async () => {
        if (cartItems.length === 0)
        {
            return;
        }

        const placedOrders = []

        // Process each cart item as an individual order
        for (const item of cartItems)
        {
            const orderPayload = {
                // Pass the product as an object containing its ID.
                product: {id: item.product.id},
                quantity: item.quantity,
                paymentType: 'CASH',
                // Optional custom instructions provided by the user.
                instructions: shippingInfo.notes,
                // Include product details so the order retains key info if the product is later deleted.
                productName: item.product.name,
                productPrice: item.product.price
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(orderPayload)
            });

            if (!res.ok)
            {
                console.error('Failed to create order for product:', item.product.name);
                return; // Abort if one order fails
            }

            const orderData = await res.json();
            placedOrders.push(orderData);
        }

        clearCart();
        // Navigate to confirmation page, passing along the placed orders
        navigate('/store/order-confirmation', {state: {orders: placedOrders}});
    };

    return (
        <div className="checkout-container">
            <h2>Checkout</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="cart-summary">
                    <h3>Your Cart Items:</h3>
                    <ul>
                        {cartItems.map(item => (
                            <li key={item.product.id}>
                                <strong>{item.product.name}</strong> – Quantity: {item.quantity}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <textarea
                placeholder="Order Notes"
                value={shippingInfo.notes}
                onChange={e => setShippingInfo({...shippingInfo, notes: e.target.value})}
            />
            <button className="btn place-order-btn" onClick={handleSubmit}>
                Place Order
            </button>
        </div>
    );
}
