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
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const allRoles: Role[] = [Role.USER, Role.CLASS_REP, Role.STUCO, Role.ADMIN];
    const [editableName, setEditableName] = useState('');
    const [selectedRole, setSelectedRole] = useState<Role | ''>('');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (!user || (user.role !== 2 && user.role !== 3)) {
            navigate('/');
            return;
        }
        fetchUserDetail();
    }, [user, navigate]);

    // Detect if there are changes to save
    useEffect(() => {
        if (detailUser) {
            setHasChanges(
                editableName.trim() !== detailUser.name || 
                selectedRole !== detailUser.role
            );
        }
    }, [editableName, selectedRole, detailUser]);

    async function fetchUserDetail() {
        if (!id) return;
        setLoading(true);
        setErrorMessage(null);
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
            setErrorMessage('Failed to load user details. Please try again.');
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

    function getRoleBadgeClass(role: Role): string {
        switch(role) {
            case Role.ADMIN: return 'role-badge-admin';
            case Role.STUCO: return 'role-badge-stuco';
            case Role.CLASS_REP: return 'role-badge-classrep';
            default: return 'role-badge-user';
        }
    }

    async function saveChanges() {
        if (!id || selectedRole === '') return;
        setUpdating(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        
        try {
            const token = localStorage.getItem('token');
            let updated = false;

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
                const updatedData = await res.json();
                setDetailUser(updatedData);
                updated = true;
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
                const updatedData = await res.json();
                setDetailUser(updatedData);
                setSelectedRole(updatedData.role);
                updated = true;
            }

            if (updated) {
                setSuccessMessage('Changes saved successfully!');
                setHasChanges(false);
                // Auto-dismiss success message after 3 seconds
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setSuccessMessage('No changes to save.');
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (err) {
            console.error(err);
            setErrorMessage('An error occurred while saving changes. Please try again.');
        } finally {
            setUpdating(false);
        }
    }

    if (loading) {
        return (
            <div className="admin-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading user details...</p>
                </div>
            </div>
        );
    }
    
    if (!detailUser) {
        return (
            <div className="admin-container">
                <div className="error-message">
                    <h2>User Not Found</h2>
                    <p>The requested user could not be found.</p>
                    <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>
                        Back to Users
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Edit User</h1>
                <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>
                    Back to Users
                </button>
            </div>

            {errorMessage && (
                <div className="alert alert-danger">
                    <p>{errorMessage}</p>
                    <button className="close-btn" onClick={() => setErrorMessage(null)}>×</button>
                </div>
            )}

            {successMessage && (
                <div className="alert alert-success">
                    <p>{successMessage}</p>
                    <button className="close-btn" onClick={() => setSuccessMessage(null)}>×</button>
                </div>
            )}

            <div className="user-edit-card">
                <div className="user-profile-header">
                    <div className="user-avatar">
                        {detailUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-meta">
                        <h2>{detailUser.name}</h2>
                        <span className={`role-badge ${getRoleBadgeClass(detailUser.role)}`}>
                            {roleToString(detailUser.role)}
                        </span>
                        <span className="user-id">ID: {detailUser.id}</span>
                    </div>
                </div>

                <div className="form-section">
                    <h3>User Information</h3>
                    
                    <div className="form-group">
                        <label htmlFor="userName">Name:</label>
                        <input
                            id="userName"
                            type="text"
                            value={editableName}
                            onChange={(e) => setEditableName(e.target.value)}
                            placeholder="Full Name"
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="userEmail">Email:</label>
                        <input 
                            id="userEmail"
                            type="email" 
                            value={detailUser.email} 
                            disabled 
                            className="form-control disabled"
                        />
                        <small className="form-text">Email addresses cannot be changed</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="userRole">Role:</label>
                        <select
                            id="userRole"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(Number(e.target.value) as Role)}
                            disabled={getAvailableRoles().length === 0}
                            className="form-control"
                        >
                            {getAvailableRoles().map((r) => (
                                <option key={r} value={r}>
                                    {roleToString(r)}
                                </option>
                            ))}
                        </select>
                        {getAvailableRoles().length === 0 && (
                            <small className="form-text">You don't have permission to change roles</small>
                        )}
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        className="btn btn-primary" 
                        onClick={saveChanges} 
                        disabled={updating || !hasChanges}
                    >
                        {updating ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
                    </button>
                    <button 
                        className="btn btn-outline" 
                        onClick={() => {
                            if (detailUser) {
                                setEditableName(detailUser.name);
                                setSelectedRole(detailUser.role);
                            }
                        }}
                        disabled={!hasChanges}
                    >
                        Reset Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
