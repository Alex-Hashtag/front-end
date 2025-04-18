import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../../styles/infrastructure.css';

interface ErrorPageProps {
    statusCode?: number;
    title?: string;
    message?: string;
}

export default function ErrorPage({ 
    statusCode = 500, 
    title = "Something Went Wrong", 
    message = "An unexpected error has occurred. Our team has been notified."
}: ErrorPageProps) {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);
    
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            navigate('/');
        }
    }, [countdown, navigate]);

    return (
        <div className="infrastructure-container error-page">
            <div className="infrastructure-content">
                <h1>{statusCode}</h1>
                <h2>{title}</h2>
                <p>{message}</p>
                <p className="countdown">Redirecting to home page in {countdown} seconds...</p>
                <div className="infrastructure-actions">
                    <Link to="/" className="btn btn-primary">Go to Homepage Now</Link>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="btn btn-secondary"
                    >
                        Try Again
                    </button>
                </div>
                <div className="illustration">
                    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
            </div>
        </div>
    );
}
