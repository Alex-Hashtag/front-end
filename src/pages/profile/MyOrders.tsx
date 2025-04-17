import {useEffect, useState} from 'react';
import {useAuth} from '../../context/AuthContext';
import {useNavigate} from 'react-router-dom';
import {Order} from '../../types/Order';

interface GroupedOrderItem
{
    productName: string;
    productPrice: number;
    quantity: number;
}

interface GroupedOrder
{
    instructions: string;
    status: 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED';
    items: GroupedOrderItem[];
    assignedRep?: {
        username: string;
        fullName?: string;
    };
    paidAt?: string;
}

export default function MyOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const {user} = useAuth();
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState<'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED'>('PENDING');

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user)
            {
                setLoading(false);
                return;
            }
            try
            {
                const res = await fetch(
                    '/api/orders?page=0&size=50&sort=createdAt,desc',
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                if (!res.ok)
                {
                    throw new Error('Failed to load orders');
                }
                const data = await res.json();
                setOrders(data.content);
            } catch (error)
            {
                console.error('Error fetching orders:', error);
            } finally
            {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const groupOrders = (orders: Order[]): GroupedOrder[] => {
        const filteredOrders = orders.filter(order => order.status === selectedTab);
        const groups: { [key: string]: GroupedOrder } = {};

        filteredOrders.forEach(order => {
            const instr = order.instructions && order.instructions.trim() !== ''
                ? order.instructions.trim()
                : 'No Instructions';
            
            const groupKey = `${instr}_${order.assignedRep?.id || 'none'}`;
            
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    instructions: instr,
                    status: order.status,
                    items: [],
                    assignedRep: order.assignedRep,
                    paidAt: order.paidAt
                };
            }
            
            groups[groupKey].items.push({
                productName: order.productName,
                productPrice: order.productPrice || 0,
                quantity: order.quantity
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

    return (
        <div className="my-orders-container">
            <h2>My Orders</h2>

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
                <div>Loading your orders...</div>
            ) : groupedOrders.length > 0 ? (
                groupedOrders.map((group, index) => (
                    <div key={index} className="order-group">
                        <h3>Instructions: {group.instructions}</h3>
                        {group.assignedRep && (
                            <p>Assigned to: {group.assignedRep.fullName || group.assignedRep.username}</p>
                        )}
                        {selectedTab === 'PAID' && group.paidAt && (
                            <p>Paid at: {formatDate(group.paidAt)}</p>
                        )}
                        <ul>
                            {group.items.map((item, idx) => (
                                <li key={idx}>
                                    <strong>{item.productName}</strong> – Quantity: {item.quantity} - Price: ${item.productPrice}
                                </li>
                            ))}
                        </ul>
                        <hr/>
                    </div>
                ))
            ) : (
                <p>No orders found with {selectedTab} status.</p>
            )}

            <button className="btn" onClick={() => navigate('/profile')}>
                Back to Profile
            </button>
        </div>
    );
}
