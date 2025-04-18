import {useEffect, useState} from 'react';
import {useAuth} from '../../context/AuthContext';
import {useNavigate} from 'react-router-dom';

export default function AdminDashboard() {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || (user.role !== 1 && user.role !== 2 && user.role !== 3))
        {
            navigate('/');
            return;
        }

        const fetchStats = async () => {
            try
            {
                const res = await fetch('/api/orders/stats', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!res.ok)
                {
                    throw new Error('Failed to fetch order stats');
                }
            } catch (error)
            {
                console.error(error);
            } finally
            {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, navigate]);

    if (loading)
    {
        return <div>Loading admin dashboard...</div>;
    }

    return (
        <div className="admin-container">
            <h1>Admin Overview</h1>

            <div className="admin-actions">
                <button className="btn" onClick={() => navigate('/admin/users')}>
                    Manage Users
                </button>
                {user && user.role > 1 && (
                    <button className="btn" onClick={() => navigate('/admin/balance')}>
                        Rep Balances
                    </button>
                )}
            </div>
        </div>
    );
}
