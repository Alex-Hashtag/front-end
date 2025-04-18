import '../../styles/infrastructure.css';

interface MaintenanceProps {
    estimatedTime?: string;
    message?: string;
}

export default function Maintenance({ 
    estimatedTime = "a few hours", 
    message = "We're currently performing scheduled maintenance to improve your experience." 
}: MaintenanceProps) {
    return (
        <div className="infrastructure-container maintenance">
            <div className="infrastructure-content">
                <h1>Under Maintenance</h1>
                <h2>We'll be back soon!</h2>
                <p>{message}</p>
                <p className="estimated-time">Estimated completion time: <strong>{estimatedTime}</strong></p>
                <div className="infrastructure-actions">
                    <button 
                        onClick={() => window.location.reload()} 
                        className="btn btn-primary"
                    >
                        Refresh Page
                    </button>
                    <a 
                        href="mailto:stuco@acsbg.org"
                        className="btn btn-secondary"
                    >
                        Contact Support
                    </a>
                </div>
                <div className="illustration">
                    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 19V5M5 12l7-7 7 7M5 19h14"></path>
                    </svg>
                </div>
            </div>
        </div>
    );
}
