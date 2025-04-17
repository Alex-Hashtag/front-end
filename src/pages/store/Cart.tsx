import {useCart} from '../../context/CartContext'
import {useNavigate} from 'react-router-dom'

export default function Cart() {
    const {cartItems, updateQuantity, removeFromCart} = useCart()
    const navigate = useNavigate()

    const total = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    )

    return (
        <div className="container">
            <h2>Shopping Cart</h2>
            {cartItems.map(item => (
                <div key={item.product.id} className="cart-item">
                    <h3>{item.product.name}</h3>
                    <input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateQuantity(item.product.id, parseInt(e.target.value))}
                    />
                    <button onClick={() => removeFromCart(item.product.id)}>
                        Remove
                    </button>
                </div>
            ))}

            <div className="cart-total">Total: {total.toFixed(2)} BGN</div>

            {/* Added btn and proceed-btn classes */}
            <button
                className="btn proceed-btn"
                onClick={() => navigate('/store/checkout')}
            >
                Proceed to Checkout
            </button>
        </div>
    )
}
