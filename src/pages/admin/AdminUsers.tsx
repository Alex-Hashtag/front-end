import {useEffect, useState, ChangeEvent, JSX, KeyboardEvent} from 'react';
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
    status: 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED';
    paymentType: 'CASH' | 'PREPAID';
    createdAt: string;
    paidAt?: string;
    totalPrice: number;
    buyer: {
        id: number;
        username?: string;
        fullName?: string;
    };
    assignedRep?: {
        id: number;
        username?: string;
        fullName?: string;
    };
    product?: {
        id: number;
        name: string;
        price: number;
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

// Sort settings type
type SortConfig = {
    key: keyof UserType | '';
    direction: 'asc' | 'desc';
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

    // Sort configuration state
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: '',
        direction: 'asc'
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

    async function updateOrderStatus(orderId: number, newStatus: 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED') {
        try {
            const res = await fetch(`/api/orders/${orderId}/status?status=${newStatus}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to update order status');
            }
            if (selectedUser) {
                fetchUserOrders(selectedUser);
            }
        } catch (err) {
            console.error(err);
            alert(err instanceof Error ? err.message : 'Failed to update order status');
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

    // --------------------- SORTING FUNCTIONALITY ---------------------
    function sortUsers(users: UserType[], sortKey: keyof UserType | '', sortDirection: 'asc' | 'desc'): UserType[] {
        if (!sortKey) return users;
        
        return [...users].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];
            
            // Handle null/undefined values
            if (aValue === undefined && bValue === undefined) return 0;
            if (aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
            if (bValue === undefined) return sortDirection === 'asc' ? -1 : 1;
            
            // Compare values based on their types
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' 
                    ? aValue - bValue 
                    : bValue - aValue;
            }
            
            // Default comparison for other types as strings
            return sortDirection === 'asc'
                ? String(aValue).localeCompare(String(bValue))
                : String(bValue).localeCompare(String(aValue));
        });
    }
    
    function requestSort(key: keyof UserType) {
        let direction: 'asc' | 'desc' = 'asc';
        
        // If already sorting by this key, toggle direction
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        
        setSortConfig({ key, direction });
        
        // Apply sorting to filtered users
        const sortedUsers = sortUsers(filteredUsers, key, direction);
        setFilteredUsers(sortedUsers);
    }
    
    // Get sort indicator JSX element for column header
    function getSortIndicator(key: keyof UserType): JSX.Element {
        const isActive = sortConfig.key === key;
        const direction = sortConfig.direction;
        
        return (
            <span className={`sort-indicator ${isActive ? 'active' : ''} ${isActive ? direction : ''}`}>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M7 9l5-5 5 5"></path>  {/* Up arrow */}
                    <path d="M7 15l5 5 5-5"></path> {/* Down arrow */}
                </svg>
            </span>
        );
    }

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

        // Apply current sort if one exists
        if (sortConfig.key) {
            return sortUsers(result, sortConfig.key, sortConfig.direction);
        }
        
        return result;
    }

    // Apply sortConfig to filtered results whenever we update filteredUsers
    useEffect(() => {
        if (sortConfig.key) {
            const sortedUsers = sortUsers(filteredUsers, sortConfig.key, sortConfig.direction);
            setFilteredUsers(sortedUsers);
        }
    }, [allUsers]);

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

    // Handle key down events for search input
    function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault();
            onApplyFilter();
        }
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
                .filter((v) => v !== '')
                .map((v) => parseFloat(v));
            eqValues.forEach((val) => params.append('balanceEq', val.toString()));
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
                    onKeyDown={handleSearchKeyDown}
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
                    <h3 className="filters-heading">Advanced Filters</h3>
                    
                    <div className="filter-section">
                        <h4 className="filter-section-title">User Criteria</h4>
                        <div className="filter-row">
                            <div className="filter-field checkbox-group">
                                <label>Roles:</label>
                                <div className="checkbox-row">
                                    {['USER', 'CLASS_REP', 'STUCO', 'ADMIN'].map(role => (
                                        <label key={role} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                value={role}
                                                checked={filters.selectedRoles.includes(role)}
                                                onChange={handleRoleCheckboxChange}
                                                title={`Include ${role} role`}
                                            />
                                            {role}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-field">
                                <label title="The last 2 digits in the user's email, e.g. someone.smith25@acsbg.org => 25">
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
                    </div>
                    
                    <div className="filter-section">
                        <h4 className="filter-section-title">Balance Filters</h4>
                        <div className="filter-row">
                            <div className="filter-field">
                                <label title="Exact balance matches, comma separated. e.g. 5,10.50">
                                    Balance Exact Match
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
                                    Balance Greater Than
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
                                    Balance Less Than
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
                    </div>

                    <div className="filter-section">
                        <h4 className="filter-section-title">Additional Options</h4>
                        <div className="filter-row">
                            <div className="filter-field checkbox-group">
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
                    </div>

                    <div className="filter-actions">
                        <button className="btn btn-primary" onClick={onApplyFilter} title="Apply all filters">
                            Apply Filters
                        </button>
                        <button 
                            className="btn btn-secondary" 
                            onClick={() => {
                                setFilters({
                                    searchTerm: '',
                                    selectedRoles: [],
                                });
                                setFilteredUsers(allUsers);
                            }} 
                            title="Clear all filters"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {/* ------------- Users List ------------- */}
            <div className="users-table-container">
                <table className="admin-table users-table">
                    <thead>
                        <tr>
                            <th className="sortable-header" onClick={() => requestSort('name')}>
                                Name {getSortIndicator('name')}
                            </th>
                            <th className="sortable-header" onClick={() => requestSort('email')}>
                                Email {getSortIndicator('email')}
                            </th>
                            <th className="sortable-header" onClick={() => requestSort('role')}>
                                Role {getSortIndicator('role')}
                            </th>
                            <th className="sortable-header" onClick={() => requestSort('collectedBalance')}>
                                Balance {getSortIndicator('collectedBalance')}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((u) => (
                            <tr key={u.id} className="user-row">
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td><span className={`role-badge ${u.role.toLowerCase()}`}>{u.role}</span></td>
                                <td>
                                    {u.collectedBalance !== undefined ? (
                                        <span className="balance-amount">{u.collectedBalance.toFixed(2)}</span>
                                    ) : (
                                        <span className="no-balance">N/A</span>
                                    )}
                                </td>
                                <td>
                                    <div className="row-actions">
                                        <button className="btn btn-sm" onClick={() => fetchUserOrders(u)}>
                                            View Orders
                                        </button>
                                        {/* if user has role 2=CLASS_REP or 3=STUCO, show an Edit button */}
                                        {user && (user.role === 2 || user.role === 3) && (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => navigate(`/admin/users/${u.id}`)}
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && !loading && (
                    <div className="no-results">
                        <p>No users found matching the current filters.</p>
                    </div>
                )}
            </div>

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
                                            <th>Assigned To</th>
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
                                                        {order.assignedRep ? 
                                                            (order.assignedRep.fullName || order.assignedRep.username) : 
                                                            'Not assigned'}
                                                    </td>
                                                    <td className="text-center">
                                                        {order.status === 'PENDING' && (
                                                            <button
                                                                className="btn btn-success"
                                                                onClick={() => updateOrderStatus(order.id, 'PAID')}
                                                            >
                                                                Mark Paid
                                                            </button>
                                                        )}
                                                        {' '}
                                                        {order.status === 'PAID' && (
                                                            <button
                                                                className="btn btn-secondary"
                                                                onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                                                            >
                                                                Mark Delivered
                                                            </button>
                                                        )}
                                                        {' '}
                                                        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                                                            <button
                                                                className="btn btn-danger"
                                                                onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
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
