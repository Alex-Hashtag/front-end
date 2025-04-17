import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Order } from '../../types/Order';

interface GroupedOrderItem {
    id: number;
    productName: string;
    productPrice: number;
    quantity: number;
    status: 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED';
    buyerName?: string;
}

interface GroupedOrder {
    instructions: string;
    status: 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED';
    items: GroupedOrderItem[];
    paidAt?: string;
}

export default function AssignedOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState<'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED'>('PENDING');

    useEffect(() => {
        const fetchAssignedOrders = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            
            try {
                const res = await fetch(
                    '/api/orders/assigned?page=0&size=50&sort=createdAt,desc',
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                
                if (!res.ok) {
                    throw new Error('Failed to load assigned orders');
                }
                
                const data = await res.json();
                setOrders(data.content);
            } catch (error) {
                console.error('Error fetching assigned orders:', error);
                setError('Failed to load assigned orders. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAssignedOrders();
    }, [user]);

    const groupOrders = (orders: Order[]): GroupedOrder[] => {
        const filteredOrders = orders.filter(order => order.status === selectedTab);
        const groups: { [key: string]: GroupedOrder } = {};

        filteredOrders.forEach(order => {
            const instr = order.instructions && order.instructions.trim() !== ''
                ? order.instructions.trim()
                : 'No Instructions';
            
            const groupKey = `${instr}`;
            
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    instructions: instr,
                    status: order.status,
                    items: [],
                    paidAt: order.paidAt
                };
            }
            
            groups[groupKey].items.push({
                id: order.id,
                productName: order.productName,
                productPrice: order.productPrice || 0,
                quantity: order.quantity,
                status: order.status,
                buyerName: order.buyer?.fullName || order.buyer?.username
            });
        });

        return Object.values(groups);
    };

    const groupedOrders = groupOrders(orders);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not paid yet';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const updateOrderStatus = async (orderId: number, newStatus: 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED') => {
        try {
            const res = await fetch(`/api/orders/${orderId}/status?status=${newStatus}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to update order status');
            }
            
            // Refresh the orders after updating
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId 
                        ? { ...order, status: newStatus, 
                            paidAt: newStatus === 'PAID' ? new Date().toISOString() : order.paidAt } 
                        : order
                )
            );
        } catch (err) {
            console.error(err);
            alert(err instanceof Error ? err.message : 'Failed to update order status');
        }
    };

    return (
        <div className="assigned-orders-container">
            <h2>My Assigned Orders</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="tabs">
                <button
                    className={`tab-btn ${selectedTab === 'PENDING' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('PENDING')}
                >
                    Pending
                </button>
                <button
                    className={`tab-btn ${selectedTab === 'PAID' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('PAID')}
                >
                    Paid
                </button>
                <button
                    className={`tab-btn ${selectedTab === 'DELIVERED' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('DELIVERED')}
                >
                    Delivered
                </button>
                <button
                    className={`tab-btn ${selectedTab === 'CANCELLED' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('CANCELLED')}
                >
                    Cancelled
                </button>
            </div>

            {loading ? (
                <div>Loading your assigned orders...</div>
            ) : groupedOrders.length > 0 ? (
                <div className="orders-list">
                    {groupedOrders.map((group, index) => (
                        <div key={index} className="order-group">
                            <h3>Instructions: {group.instructions}</h3>
                            {selectedTab === 'PAID' && group.paidAt && (
                                <p>Paid at: {formatDate(group.paidAt)}</p>
                            )}
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Customer</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.items.map((item) => {
                                        const totalPrice = item.productPrice * item.quantity;
                                        return (
                                            <tr key={item.id}>
                                                <td>{item.id}</td>
                                                <td>{item.productName}</td>
                                                <td>{item.quantity}</td>
                                                <td>{totalPrice.toFixed(2)} BGN</td>
                                                <td>{item.buyerName || 'Unknown'}</td>
                                                <td>
                                                    {item.status === 'PENDING' && (
                                                        <button
                                                            className="btn btn-success"
                                                            onClick={() => updateOrderStatus(item.id, 'PAID')}
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    )}
                                                    {' '}
                                                    {item.status === 'PAID' && (
                                                        <button
                                                            className="btn btn-secondary"
                                                            onClick={() => updateOrderStatus(item.id, 'DELIVERED')}
                                                        >
                                                            Mark Delivered
                                                        </button>
                                                    )}
                                                    {' '}
                                                    {item.status !== 'CANCELLED' && item.status !== 'DELIVERED' && (
                                                        <button
                                                            className="btn btn-danger"
                                                            onClick={() => updateOrderStatus(item.id, 'CANCELLED')}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <hr/>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No {selectedTab.toLowerCase()} orders are assigned to you.</p>
            )}

            <button className="btn" onClick={() => navigate('/profile')}>
                Back to Profile
            </button>
        </div>
    );
}
