import { useEffect, useState, ChangeEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserType {
    id: number;
    name: string;
    email: string;
    role: string; // we’ll store the role as a string for display
    collectedBalance?: number;
}

interface OrderType {
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

interface GroupedOrders {
    instructions: string;
    items: OrderType[];
}

// Updated: we add `activeOrders?: boolean` to the filter
type FilterSettings = {
    searchTerm: string;
    selectedRoles: string[];
    graduationYear?: number;
    balanceEqCSV?: string;
    balanceGt?: number;
    balanceLt?: number;
    activeOrders?: boolean;     // new boolean filter
};

export default function AdminUsers() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Full set of users loaded from the server
    const [allUsers, setAllUsers] = useState<UserType[]>([]);
    // Locally filtered users displayed in the UI
    const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);

    // Current advanced filters
    const [filters, setFilters] = useState<FilterSettings>({
        searchTerm: '',
        selectedRoles: [],
    });

    // Whether we’re showing/hiding the advanced filter section
    const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

    // UI states for user detail / orders
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [userOrders, setUserOrders] = useState<OrderType[]>([]);
    const [loading, setLoading] = useState(false);

    // --------------------- EFFECT: AUTH CHECK + INITIAL LOAD ---------------------
    useEffect(() => {
        if (!user || (user.role !== 1 && user.role !== 2 && user.role !== 3)) {
            navigate('/');
            return;
        }
        // Perform an initial fetch of a large page of users
        fetchAllUsers();
    }, [user, navigate]);

    // --------------------- FETCH ALL USERS ---------------------
    async function fetchAllUsers(filterParams?: URLSearchParams) {
        setLoading(true);
        try {
            let endpoint = `/api/users?page=0&size=9999`;
            if (filterParams) {
                endpoint = `/api/users/search?${filterParams.toString()}`;
            }

            const res = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();

            const usersFetched = data.content || [];
            setAllUsers(usersFetched);
            setFilteredUsers(usersFetched);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // --------------------- USER ORDERS ---------------------
    async function fetchUserOrders(u: UserType) {
        setSelectedUser(u);
        setLoading(true);
        try {
            const res = await fetch(`/api/orders/admin?page=0&size=9999`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch orders');
            const data = await res.json();

            const filtered = data.content.filter((o: OrderType) => o.buyer.id === u.id);
            setUserOrders(filtered);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function updateOrderStatus(orderId: number, newStatus: string) {
        try {
            const res = await fetch(`/api/orders/${orderId}/status?status=${newStatus}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!res.ok) throw new Error('Failed to update order status');
            if (selectedUser) {
                fetchUserOrders(selectedUser);
            }
        } catch (err) {
            console.error(err);
        }
    }

    // --------------------- ORDER GROUPING ---------------------
    function groupOrdersByInstructions(orders: OrderType[]): GroupedOrders[] {
        const map = new Map<string, OrderType[]>();
        orders.forEach((order) => {
            const instr =
                order.instructions && order.instructions.trim() !== ''
                    ? order.instructions.trim()
                    : 'No Instructions';
            if (!map.has(instr)) {
                map.set(instr, []);
            }
            map.get(instr)!.push(order);
        });
        return Array.from(map.entries()).map(([instructions, items]) => ({
            instructions,
            items,
        }));
    }

    const groupedUserOrders = groupOrdersByInstructions(userOrders);

    // --------------------- LOCAL FILTERING LOGIC ---------------------
    function applyLocalFilters(all: UserType[], fs: FilterSettings): UserType[] {
        let result = [...all];

        // searchTerm
        if (fs.searchTerm.trim() !== '') {
            const term = fs.searchTerm.toLowerCase();
            result = result.filter(
                (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
            );
        }

        // roles
        if (fs.selectedRoles.length > 0) {
            result = result.filter((u) => fs.selectedRoles.includes(u.role));
        }

        // graduationYear
        if (fs.graduationYear != null) {
            const formatted = String(fs.graduationYear).padStart(2, '0');
            result = result.filter((u) => u.email.includes(`.${formatted}@acsbg.org`));
        }

        // balanceEqCSV (comma‐separated)
        if (fs.balanceEqCSV && fs.balanceEqCSV.trim() !== '') {
            const eqValues = fs.balanceEqCSV
                .split(',')
                .map((val) => val.trim())
                .filter((v) => v !== '')
                .map((v) => parseFloat(v));
            result = result.filter((u) => {
                if (u.collectedBalance == null) return false;
                return eqValues.some((num) => u.collectedBalance === num);
            });
        }

        // balanceGt
        if (fs.balanceGt != null) {
            result = result.filter((u) => {
                if (u.collectedBalance == null) return false;
                return u.collectedBalance > fs.balanceGt!;
            });
        }

        // balanceLt
        if (fs.balanceLt != null) {
            result = result.filter((u) => {
                if (u.collectedBalance == null) return false;
                return u.collectedBalance < fs.balanceLt!;
            });
        }

        // ❓ activeOrders => Local filtering is tricky because we’d need all orders.
        // We skip local filtering here and rely on server side if activeOrders is set.

        return result;
    }

    // --------------------- HANDLERS FOR FILTER INPUTS ---------------------

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof FilterSettings) {
        const value = e.target.type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : e.target.value;

        setFilters((prev) => ({
            ...prev,
            [field]: value === '' ? undefined : value,
        }));
    }

    // Roles as checkboxes
    function handleRoleCheckboxChange(e: ChangeEvent<HTMLInputElement>) {
        const { value, checked } = e.target;
        setFilters((prev) => {
            const current = new Set(prev.selectedRoles);
            if (checked) {
                current.add(value);
            } else {
                current.delete(value);
            }
            return { ...prev, selectedRoles: Array.from(current) };
        });
    }

    // --------------------- APPLY FILTERS BUTTON ---------------------
    function onApplyFilter() {
        // Apply local filters
        const localResult = applyLocalFilters(allUsers, filters);
        setFilteredUsers(localResult);

        // Build /api/users/search to ensure completeness from server
        const params = new URLSearchParams();

        // roles
        if (filters.selectedRoles.length > 0) {
            filters.selectedRoles.forEach((r) => params.append('roles', r));
        }

        // searchTerm
        if (filters.searchTerm) {
            params.append('searchTerm', filters.searchTerm);
        }

        // graduationYear
        if (filters.graduationYear) {
            params.append('graduationYear', String(filters.graduationYear));
        }

        // “balanceEqCSV” => multiple “balanceEq” params
        if (filters.balanceEqCSV) {
            const eqValues = filters.balanceEqCSV
                .split(',')
                .map((val) => val.trim())
                .filter((v) => v !== '');
            eqValues.forEach((val) => params.append('balanceEq', val));
        }

        // balanceGt, balanceLt
        if (filters.balanceGt) {
            params.append('balanceGt', String(filters.balanceGt));
        }
        if (filters.balanceLt) {
            params.append('balanceLt', String(filters.balanceLt));
        }

        // 🆕 activeOrders
        if (filters.activeOrders) {
            params.append('activeOrders', 'true');
        }

        params.append('page', '0');
        params.append('size', '9999');

        // Re-fetch from server
        fetchAllUsers(params);
    }

    return (
        <div className="admin-container">
            <h1>Manage Users</h1>

            {loading && <p>Loading...</p>}

            {/* ------------- Main Filter Bar ------------- */}
            <div className="search-bar-container">
                <input
                    type="text"
                    className="search-bar"
                    title="Type name or email to filter"
                    placeholder="Search by name or email..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                        setFilters((prev) => ({
                            ...prev,
                            searchTerm: e.target.value,
                        }))
                    }
                />

                <button className="btn" onClick={onApplyFilter} title="Click to search locally & fetch from server">
                    Search
                </button>

                <button
                    className="btn btn-secondary advanced-filter-button"
                    onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                    title="Toggle advanced filters"
                >
                    {showAdvancedFilter ? 'Hide Filters' : 'Advanced Filters'}
                </button>
            </div>

            {/* ------------- Advanced Filters Section ------------- */}
            {showAdvancedFilter && (
                <div className="advanced-filters">
                    <div className="filter-row">
                        <div className="filter-field checkbox-group">
                            <label>Roles:</label>
                            <div className="checkbox-row">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        value="USER"
                                        checked={filters.selectedRoles.includes('USER')}
                                        onChange={handleRoleCheckboxChange}
                                        title="Include USER role"
                                    />
                                    USER
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        value="CLASS_REP"
                                        checked={filters.selectedRoles.includes('CLASS_REP')}
                                        onChange={handleRoleCheckboxChange}
                                        title="Include CLASS_REP role"
                                    />
                                    CLASS_REP
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        value="STUCO"
                                        checked={filters.selectedRoles.includes('STUCO')}
                                        onChange={handleRoleCheckboxChange}
                                        title="Include STUCO role"
                                    />
                                    STUCO
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        value="ADMIN"
                                        checked={filters.selectedRoles.includes('ADMIN')}
                                        onChange={handleRoleCheckboxChange}
                                        title="Include ADMIN role"
                                    />
                                    ADMIN
                                </label>
                            </div>
                        </div>

                        <div className="filter-field">
                            <label title="The last 2 digits in the user’s email, e.g. someone.smith25@acsbg.org => 25">
                                Graduation Year:
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 24"
                                value={filters.graduationYear ?? ''}
                                onChange={(e) => handleChange(e, 'graduationYear')}
                                title="Enter 2 digits"
                            />
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="filter-field">
                            <label title="Exact balance matches, comma separated. e.g. 5,10.50">
                                Balance =
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 5,10.00"
                                value={filters.balanceEqCSV ?? ''}
                                onChange={(e) => handleChange(e, 'balanceEqCSV')}
                                title="Comma separated list of exact balances"
                            />
                        </div>
                        <div className="filter-field">
                            <label title="Filter by balance greater than...">
                                Balance &gt;
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="e.g. 5.00"
                                value={filters.balanceGt || ''}
                                onChange={(e) => handleChange(e, 'balanceGt')}
                            />
                        </div>
                        <div className="filter-field">
                            <label title="Filter by balance less than...">
                                Balance &lt;
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="e.g. 20.00"
                                value={filters.balanceLt || ''}
                                onChange={(e) => handleChange(e, 'balanceLt')}
                            />
                        </div>
                    </div>

                    {/* 🆕 Active Orders checkbox */}
                    <div className="filter-row">
                        <div className="filter-field checkbox-group">
                            <label>Additional Filters:</label>
                            <div className="checkbox-row">
                                <label className="checkbox-label" title="Only fetch users who have at least one active/pending order">
                                    <input
                                        type="checkbox"
                                        checked={!!filters.activeOrders}
                                        onChange={(e) => handleChange(e, 'activeOrders')}
                                    />
                                    Has Active Orders
                                </label>
                            </div>
                        </div>
                    </div>

                    <button className="btn btn-primary" onClick={onApplyFilter} title="Apply all filters">
                        Apply Filter
                    </button>
                </div>
            )}

            {/* ------------- Users List ------------- */}
            <ul className="admin-list">
                {filteredUsers.map((u) => (
                    <li className="admin-list-item" key={u.id}>
                        <div className="admin-list-item-row">
              <span>
                {u.name} ({u.email}) [role={u.role}]
                  {u.collectedBalance !== undefined && (
                      <> — Balance: {u.collectedBalance.toFixed(2)}</>
                  )}
              </span>
                            <div className="admin-actions">
                                <button className="btn" onClick={() => fetchUserOrders(u)}>
                                    View Orders
                                </button>
                                {/* if user has role 2=CLASS_REP or 3=STUCO, show an Edit button */}
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

            {/* ------------- Selected User’s Orders ------------- */}
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
                                                        </button>{' '}
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
