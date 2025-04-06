import React, {useEffect, useState} from 'react';
import {useAuth} from '../../context/AuthContext';
import {useNavigate} from 'react-router-dom';

export default function Profile() {
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    // Local state for editing the user's info
    const [name, setName] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        setName(user.name || '');
        setAvatarPreview(user.avatarUrl || null);
    }, [user]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0)
        {
            const file = event.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const validateToken = (token: string | null): boolean => {
        if (!token)
        {
            setError('No authentication token found. Please login again.');
            return false;
        }

        const parts = token.split('.');
        if (parts.length !== 3)
        {
            setError('Invalid token format. Please login again.');
            localStorage.removeItem('token');
            logout();
            return false;
        }

        return true;
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        try
        {
            const token = localStorage.getItem('token');
            if (!validateToken(token)) return;

            if (avatarFile)
            {
                const avatarFormData = new FormData();
                avatarFormData.append('file', avatarFile);

                const avatarRes = await fetch('/api/users/upload-pfp', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: avatarFormData,
                });

                if (!avatarRes.ok)
                {
                    const errorData = await avatarRes.json();
                    throw new Error(errorData.message || 'Failed to upload profile picture');
                }
            }

            const updateRes = await fetch('/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({name}),
            });

            if (!updateRes.ok)
            {
                const errorData = await updateRes.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            alert('Profile updated successfully!');
        } catch (error)
        {
            console.error('Profile update error:', error);
            setError(error instanceof Error ? error.message : 'An unknown error occurred');

            if (error instanceof Error && error.message.includes('401'))
            {
                logout();
                navigate('/login');
            }
        } finally
        {
            setIsLoading(false);
        }
    };

    if (!user)
    {
        return (
            <div className="profile-container">
                <h2>Please log in to view your profile.</h2>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <h2>My Profile</h2>

            {error && (
                <div className="error-message" style={{color: 'red', marginBottom: '1rem'}}>
                    {error}
                </div>
            )}

            <div className="profile-info">
                <label>Avatar:</label>
                <div>
                    {avatarPreview ? (
                        <img
                            src={avatarPreview}
                            alt="Avatar Preview"
                            style={{width: '100px', height: '100px', objectFit: 'cover'}}
                        />
                    ) : (
                        <span>No avatar</span>
                    )}
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange}/>

                <label>Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                />

                <label>Email:</label>
                <input type="text" value={user.email} disabled/>

                <button
                    className="btn"
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <hr/>

            <button className="btn" onClick={() => navigate('/profile/orders')}>
                View My Orders
            </button>
        </div>
    );
}