import { Link } from 'react-router-dom';
import '../../styles/infrastructure.css';

export default function NotFound() {
    return (
        <div className="infrastructure-container not-found">
            <div className="infrastructure-content">
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>The page you are looking for doesn't exist or has been moved.</p>
                <div className="infrastructure-actions">
                    <Link to="/" className="btn btn-primary">Go to Homepage</Link>
                    <Link to="/store" className="btn btn-secondary">Visit Store</Link>
                </div>
                <div className="illustration">
                    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M8 15h8M9 9h.01M15 9h.01"></path>
                    </svg>
                </div>
            </div>
        </div>
    );
}
