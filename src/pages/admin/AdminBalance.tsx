import {useEffect, useState} from 'react';
import {useAuth} from '../../context/AuthContext';
import {useNavigate} from 'react-router-dom';

interface UserType
{
    id: number;
    name: string;
    email: string;
    role: number;
    collectedBalance: number | null; // allow null if the backend might return it
}

export default function AdminBalance() {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [reps, setReps] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || (user.role !== 2 && user.role !== 3))
        {
            navigate('/');
            return;
        }
        fetchReps();
    }, [user, navigate]);

    async function fetchReps()
    {
        setLoading(true);
        try
        {
            // Updated URL with search parameters
            const res = await fetch(
                '/api/users/search?balanceGt=0&page=0&size=50',
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (!res.ok) throw new Error('Failed to load class reps');
            const data = await res.json();
            setReps(data.content);
        } catch (err)
        {
            console.error(err);
        } finally
        {
            setLoading(false);
        }
    }

    async function markCollected(repId: number)
    {
        try
        {
            const res = await fetch(`/api/users/${repId}/balance/clear`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok)
            {
                fetchReps();
            } else
            {
                throw new Error('Failed to clear rep balance');
            }
        } catch (err)
        {
            console.error(err);
        }
    }

    if (loading)
    {
        return <div>Loading balances...</div>;
    }

    return (
        <div className="admin-container">
            <h1>Class Rep Balances</h1>

            <table className="admin-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Balance</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {reps.map((rep) => {
                    const balance = rep.collectedBalance ?? 0;
                    return (
                        <tr key={rep.id}>
                            <td>{rep.id}</td>
                            <td>{rep.name}</td>
                            <td>{rep.email}</td>
                            <td>{balance.toFixed(2)}</td>
                            <td>
                                <button
                                    className="btn btn-success"
                                    onClick={() => markCollected(rep.id)}
                                >
                                    Mark Collected
                                </button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>

            <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
                Back to Admin Dashboard
            </button>
        </div>
    );
}
