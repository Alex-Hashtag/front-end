import {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

function useQuery()
{
    return new URLSearchParams(useLocation().search);
}

export default function VerifyEmail() {
    const navigate = useNavigate();
    const query = useQuery();
    const token = query.get("token");
    const [message, setMessage] = useState("Verifying your email...");
    const [error, setError] = useState<string | null>(null);

    const hasVerified = useRef(false);

    useEffect(() => {
        async function verify()
        {
            if (!token || hasVerified.current) return;
            hasVerified.current = true;
            try
            {
                const res = await fetch(`/api/auth/verify/${token}`);
                if (!res.ok)
                {
                    const txt = await res.text();
                    throw new Error(txt);
                }
                const successMsg = await res.text();
                setMessage(successMsg);
            } catch (err: any)
            {
                setError(err.message);
            }
        }

        verify();
    }, [token]);

    return (
        <div className="container">
            <h2>Email Verification</h2>
            {error ? (
                <p style={{color: "crimson"}}>{error}</p>
            ) : (
                <p>{message}</p>
            )}
            <button className="btn" onClick={() => navigate('/login')}>
                Go to Login
            </button>
        </div>
    );
}
