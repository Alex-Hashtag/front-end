import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function VerifyEmail() {
    const navigate = useNavigate();
    const query = useQuery();
    const token = query.get("token"); // Get token from query parameters
    const [message, setMessage] = useState("Verifying your email...");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function verify() {
            if (!token) return;
            try {
                const res = await fetch(`/api/auth/verify/${token}`);
                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(txt);
                }
                const successMsg = await res.text();
                setMessage(successMsg);
                // Optionally, auto-redirect after a delay:
                // setTimeout(() => navigate('/login'), 2000);
            } catch (err: any) {
                setError(err.message);
            }
        }
        verify();
    }, [token, navigate]);

    return (
        <div className="container">
            <h2>Email Verification</h2>
            {error ? (
                <p style={{ color: "crimson" }}>{error}</p>
            ) : (
                <p>{message}</p>
            )}
            <button className="btn" onClick={() => navigate('/login')}>
                Go to Login
            </button>
        </div>
    );
}
