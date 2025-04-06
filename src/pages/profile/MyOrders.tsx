import {useEffect, useState} from 'react';
import {useAuth} from '../../context/AuthContext';
import {useNavigate} from 'react-router-dom';
import {Order} from '../../types/Order';

interface GroupedOrderItem
{
    productName: string;
    quantity: number;
}

interface GroupedOrder
{
    instructions: string;
    items: GroupedOrderItem[];
}

export default function MyOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const {user} = useAuth();
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState<'PENDING' | 'PAID'>('PENDING');

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
                const filtered = data.content.filter(
                    (o: Order) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
                );
                setOrders(filtered);
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
        const groups: { [instr: string]: { [productName: string]: number } } = {};

        filteredOrders.forEach(order => {
            const instr = order.instructions && order.instructions.trim() !== ''
                ? order.instructions.trim()
                : 'No Instructions';
            if (!groups[instr])
            {
                groups[instr] = {};
            }
            if (!groups[instr][order.productName])
            {
                groups[instr][order.productName] = 0;
            }
            groups[instr][order.productName] += order.quantity;
        });

        return Object.entries(groups).map(([instructions, items]) => ({
            instructions,
            items: Object.entries(items).map(([productName, quantity]) => ({
                productName,
                quantity
            }))
        }));
    };

    const groupedOrders = groupOrders(orders);

    return (
        <div className="my-orders-container">
            <h2>My Active Orders</h2>

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
            </div>

            {loading ? (
                <div>Loading your orders...</div>
            ) : groupedOrders.length > 0 ? (
                groupedOrders.map((group, index) => (
                    <div key={index} className="order-group">
                        <h3>Instructions: {group.instructions}</h3>
                        <ul>
                            {group.items.map((item, idx) => (
                                <li key={idx}>
                                    <strong>{item.productName}</strong> – Quantity: {item.quantity}
                                </li>
                            ))}
                        </ul>
                        <hr/>
                    </div>
                ))
            ) : (
                <p>No active orders found for {selectedTab} status.</p>
            )}

            <button className="btn" onClick={() => navigate('/profile')}>
                Back to Profile
            </button>
        </div>
    );
}
