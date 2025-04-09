import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

enum Role {
    USER = 0,
    CLASS_REP = 1,
    STUCO = 2,
    ADMIN = 3
}

interface UserType {
    id: number;
    name: string;
    email: string;
    role: Role;
}

export default function AdminUserDetail() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [detailUser, setDetailUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const allRoles: Role[] = [Role.USER, Role.CLASS_REP, Role.STUCO, Role.ADMIN];
    const [editableName, setEditableName] = useState('');
    const [selectedRole, setSelectedRole] = useState<Role | ''>('');

    useEffect(() => {
        if (!user || (user.role !== 2 && user.role !== 3)) {
            navigate('/');
            return;
        }
        fetchUserDetail();
    }, [user, navigate]);

    async function fetchUserDetail() {
        if (!id) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch user detail');
            const data = await res.json();
            setDetailUser(data);
            setEditableName(data.name);
            setSelectedRole(data.role);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function getAvailableRoles(): Role[] {
        if (!user) return [];
        if (user.role === Role.ADMIN) return allRoles;
        if (user.role === Role.STUCO) return allRoles.filter((r) => r < Role.STUCO);
        return [];
    }

    function roleToString(r: Role) {
        return Role[r];
    }

    async function saveChanges() {
        if (!id || selectedRole === '') return;
        setUpdating(true);
        try {
            const token = localStorage.getItem('token');

            // Update name if changed
            if (detailUser?.name !== editableName.trim()) {
                const res = await fetch(`/api/users/me`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        id: detailUser?.id,
                        name: editableName.trim(),
                        email: detailUser?.email,
                        role: detailUser?.role // not changed here
                    })
                });
                if (!res.ok) throw new Error('Failed to update name');
                const updated = await res.json();
                setDetailUser(updated);
            }

            // Update role if changed
            if (detailUser?.role !== selectedRole) {
                const roleStr = roleToString(selectedRole);
                const res = await fetch(`/api/users/${id}/role?newRole=${roleStr}`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error('Failed to update role');
                const updated = await res.json();
                setDetailUser(updated);
                setSelectedRole(updated.role);
            }

            alert('Changes saved successfully!');
        } catch (err) {
            console.error(err);
            alert('An error occurred while saving changes.');
        } finally {
            setUpdating(false);
        }
    }

    if (loading) return <div>Loading user details...</div>;
    if (!detailUser) return <div>User not found.</div>;

    return (
        <div className="admin-container">
            <h1>Edit User</h1>

            <div className="admin-detail-section">
                <div className="filter-field">
                    <label>Name:</label>
                    <input
                        type="text"
                        value={editableName}
                        onChange={(e) => setEditableName(e.target.value)}
                        placeholder="Full Name"
                    />
                </div>

                <div className="filter-field">
                    <label>Email:</label>
                    <input type="email" value={detailUser.email} disabled />
                </div>

                <div className="filter-field">
                    <label>Role:</label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(Number(e.target.value) as Role)}
                        disabled={getAvailableRoles().length === 0}
                    >
                        {getAvailableRoles().map((r) => (
                            <option key={r} value={r}>
                                {roleToString(r)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="admin-actions">
                    <button className="btn btn-primary" onClick={saveChanges} disabled={updating}>
                        {updating ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>
                        Back to Users
                    </button>
                </div>
            </div>
        </div>
    );
}
