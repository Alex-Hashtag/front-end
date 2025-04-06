import {useEffect, useState} from 'react';
import {useAuth} from '../../context/AuthContext';
import {useNavigate, useParams} from 'react-router-dom';

enum Role
{
    USER = 0,
    CLASS_REP = 1,
    STUCO = 2,
    ADMIN = 3
}

interface UserType
{
    id: number;
    name: string;
    email: string;
    role: Role;
}

export default function AdminUserDetail() {
    const {user} = useAuth();          // 'user' is the current logged-in user
    const navigate = useNavigate();
    const {id} = useParams();

    const [detailUser, setDetailUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);

    // All possible role labels as an array; order matches the enum above
    const allRoles: Role[] = [Role.USER, Role.CLASS_REP, Role.STUCO, Role.ADMIN];

    // A local piece of state for the new role we want to assign:
    const [selectedRole, setSelectedRole] = useState<Role | ''>('');

    useEffect(() => {
        // Ensure only Stuco (2) or Admin (3) can access this page at all:
        if (!user || (user.role !== Role.STUCO && user.role !== Role.ADMIN))
        {
            navigate('/');
            return;
        }
        fetchUserDetail();
        // eslint-disable-next-line
    }, [user, navigate]);

    async function fetchUserDetail()
    {
        if (!id) return;
        setLoading(true);
        try
        {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch user detail');
            const data = await res.json();
            setDetailUser(data);
            // Initialize selectedRole with the user's current role
            setSelectedRole(data.role);
        } catch (err)
        {
            console.error(err);
        } finally
        {
            setLoading(false);
        }
    }

    function getAvailableRoles(): Role[]
    {
        if (!user) return [];
        if (user.role === Role.ADMIN)
        {
            return allRoles;
        } else if (user.role === Role.STUCO)
        {
            return allRoles.filter((r) => r < Role.STUCO);
        }
        return [];
    }

    function roleToString(r: Role)
    {
        switch (r)
        {
            case Role.USER:
                return 'USER';
            case Role.CLASS_REP:
                return 'CLASS_REP';
            case Role.STUCO:
                return 'STUCO';
            case Role.ADMIN:
                return 'ADMIN';
            default:
                return 'UNKNOWN_ROLE';
        }
    }

    async function updateUserRole()
    {
        if (!id || selectedRole === '') return;
        try
        {
            const token = localStorage.getItem('token');
            const roleString = roleToString(selectedRole);
            const res = await fetch(`/api/users/${id}/role?newRole=${encodeURIComponent(roleString)}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to update user role');
            const updatedUser = await res.json();
            setDetailUser(updatedUser);
            setSelectedRole(updatedUser.role);
            alert('Role updated successfully!');
        } catch (err)
        {
            console.error(err);
            alert('An error occurred while updating the role.');
        }
    }

    if (loading)
    {
        return <div>Loading user details...</div>;
    }

    if (!detailUser)
    {
        return <div>User not found</div>;
    }

    return (
        <div className="admin-container">
            <h1>User Detail</h1>
            <div className="admin-detail-section">
                <p>
                    <strong>ID:</strong> {detailUser.id}
                </p>
                <p>
                    <strong>Name:</strong> {detailUser.name}
                </p>
                <p>
                    <strong>Email:</strong> {detailUser.email}
                </p>
                <p>
                    <strong>Role:</strong> {roleToString(detailUser.role)}
                </p>
            </div>


            {user && (user.role === Role.STUCO || user.role === Role.ADMIN) && (
                <div className="admin-detail-section role-selector">
                    <label htmlFor="roleSelect">Change role:</label>
                    <select
                        id="roleSelect"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(Number(e.target.value) as Role)}
                    >
                        {getAvailableRoles().map((r) => (
                            <option key={r} value={r}>
                                {roleToString(r)}
                            </option>
                        ))}
                    </select>
                    <button className="btn btn-primary" onClick={updateUserRole}>
                        Update Role
                    </button>
                </div>
            )}

            <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>
                Back to Users
            </button>
        </div>
    );
}
