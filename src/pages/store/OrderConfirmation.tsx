import {useLocation, useNavigate} from 'react-router-dom'
import {Order} from '../../types/Order'

export default function OrderConfirmation() {
    const {state} = useLocation()
    const navigate = useNavigate()
    const orders: Order[] = state?.orders || []

    return (
        <div className="container">
            <div className="order-confirmation">
                <h2>🎉 Order Placed Successfully!</h2>
                <p>Thank you for your purchase. Here's your order summary:</p>

                {orders.length > 0 ? (
                    <div className="order-summary">
                        {orders.map(order => (
                            <div key={order.id} className="order-item">
                                <p>Order ID: #{order.id}</p>
                                <p>Product: {order.productName}</p>
                                <p>Quantity: {order.quantity}</p>
                                <p>Total: {order.totalPrice.toFixed(2)} BGN</p>
                                <p>Status: {order.status}</p>
                                {order.instructions && (
                                    <p>Instructions: {order.instructions}</p>
                                )}
                                <hr/>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No order details found.</p>
                )}

                <div className="confirmation-actions">
                    <button className="btn" onClick={() => navigate('/store')}>
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    )
}
