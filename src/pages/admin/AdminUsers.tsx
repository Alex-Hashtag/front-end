import {useEffect, useState} from 'react';
import {useAuth} from '../../context/AuthContext';
import {useNavigate} from 'react-router-dom';

interface UserType
{
    id: number;
    name: string;
    email: string;
    role: number;
}

interface OrderType
{
    id: number;
    productName: string;
    productPrice: number;
    instructions?: string;
    quantity: number;
    status: string;
    buyer: {
        id: number;
    };
}

interface GroupedOrders
{
    instructions: string;
    items: OrderType[];
}

export default function AdminUsers() {
    const {user} = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState<UserType[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [userOrders, setUserOrders] = useState<OrderType[]>([]);
    const [loading, setLoading] = useState(false);
    const [roleFilter, setRoleFilter] = useState<string>('');

    useEffect(() => {
        if (!user || (user.role !== 2 && user.role !== 3))
        {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [user, navigate]);

    async function fetchUsers()
    {
        setLoading(true);
        try
        {
            const res = await fetch(`/api/users?page=0&size=50`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data.content);
        } catch (err)
        {
            console.error(err);
        } finally
        {
            setLoading(false);
        }
    }

    async function fetchUserOrders(u: UserType)
    {
        setSelectedUser(u);
        setLoading(true);
        try
        {
            const res = await fetch(`/api/orders/admin?page=0&size=50`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch orders');
            const data = await res.json();

            const filtered = data.content.filter((o: OrderType) => o.buyer.id === u.id);
            setUserOrders(filtered);
        } catch (err)
        {
            console.error(err);
        } finally
        {
            setLoading(false);
        }
    }

    async function updateOrderStatus(orderId: number, newStatus: string)
    {
        try
        {
            const res = await fetch(`/api/orders/${orderId}/status?status=${newStatus}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!res.ok) throw new Error('Failed to update order status');
            if (selectedUser)
            {
                fetchUserOrders(selectedUser);
            }
        } catch (err)
        {
            console.error(err);
        }
    }

    function groupOrdersByInstructions(orders: OrderType[]): GroupedOrders[]
    {
        const map = new Map<string, OrderType[]>();
        orders.forEach((order) => {
            const instr =
                order.instructions && order.instructions.trim() !== ''
                    ? order.instructions.trim()
                    : 'No Instructions';
            if (!map.has(instr))
            {
                map.set(instr, []);
            }
            map.get(instr)!.push(order);
        });
        return Array.from(map.entries()).map(([instructions, items]) => ({
            instructions,
            items
        }));
    }

    const groupedUserOrders = groupOrdersByInstructions(userOrders);

    return (
        <div className="admin-container">
            <h1>Manage Users</h1>

            {loading && <p>Loading...</p>}

            <div className="admin-filter-bar">
                <label>Filter by Role:</label>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="">All</option>
                    <option value="0">USER</option>
                    <option value="1">CLASS_REP</option>
                    <option value="2">STUCO</option>
                    <option value="3">ADMIN</option>
                </select>
                <button className="btn btn-secondary" onClick={fetchUsers}>
                    Apply Filter
                </button>
            </div>

            <ul className="admin-list">
                {users
                    .filter((u) =>
                        roleFilter === '' ? true : u.role.toString() === roleFilter
                    )
                    .map((u) => (
                        <li className="admin-list-item" key={u.id}>
                            <div className="admin-list-item-row">
                                <span>
                                    {u.name} ({u.email}) [role={u.role}]
                                </span>
                                <div className="admin-actions">
                                    <button className="btn" onClick={() => fetchUserOrders(u)}>
                                        View Orders
                                    </button>

                                    {user && (user.role === 2 || user.role === 3) && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => navigate(`/admin/users/${u.id}`)}
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
            </ul>

            {selectedUser && (
                <div className="admin-detail-section">
                    <h2>{selectedUser.name}’s Orders</h2>
                    {groupedUserOrders.length > 0 ? (
                        <>
                            {groupedUserOrders.map((group, index) => (
                                <div className="instructions-group" key={index}>
                                    <h3 className="instructions-title">
                                        Instructions: {group.instructions}
                                    </h3>
                                    <table className="admin-table">
                                        <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {group.items.map((order) => {
                                            const totalPrice = order.productPrice * order.quantity;
                                            return (
                                                <tr key={order.id}>
                                                    <td className="text-center">{order.id}</td>
                                                    <td className="text-center">{order.productName}</td>
                                                    <td className="text-center">{order.quantity}</td>
                                                    <td className="text-center">{totalPrice.toFixed(2)}</td>
                                                    <td className="text-center">{order.status}</td>
                                                    <td className="text-center">
                                                        <button
                                                            className="btn btn-success"
                                                            onClick={() => updateOrderStatus(order.id, 'PAID')}
                                                        >
                                                            Mark Paid
                                                        </button>
                                                        {' '}
                                                        <button
                                                            className="btn btn-secondary"
                                                            onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                                                        >
                                                            Mark Delivered
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </>
                    ) : (
                        <p>No orders found.</p>
                    )}
                </div>
            )}
        </div>
    );
}
