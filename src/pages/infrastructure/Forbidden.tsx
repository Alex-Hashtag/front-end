import { Link } from 'react-router-dom';
import '../../styles/infrastructure.css';

export default function Forbidden() {
    return (
        <div className="infrastructure-container forbidden">
            <div className="infrastructure-content">
                <h1>403</h1>
                <h2>Access Forbidden</h2>
                <p>You don't have permission to access this page.</p>
                <div className="infrastructure-actions">
                    <Link to="/" className="btn btn-primary">Go to Homepage</Link>
                    <Link to="/login" className="btn btn-secondary">Login</Link>
                </div>
                <div className="illustration">
                    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0110 0v4"></path>
                        <circle cx="12" cy="16" r="1"></circle>
                    </svg>
                </div>
            </div>
        </div>
    );
}
