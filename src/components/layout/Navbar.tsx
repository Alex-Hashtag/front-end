import {Link} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'
import {useState} from 'react'

export default function Navbar() {
    const {user, logout, isAuthenticated} = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen)
    }

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="logo">StuCo</Link>
            </div>

            <button 
                className="mobile-menu-btn" 
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
            >
                {mobileMenuOpen ? '✕' : '☰'}
            </button>

            <div className={`navbar-right ${mobileMenuOpen ? 'active' : ''}`}>
                <Link to="/news" className="nav-link" onClick={() => setMobileMenuOpen(false)}>News</Link>
                <Link to="/store" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Store</Link>

                {isAuthenticated ? (
                    <>
                        <div className="nav-user-group">
                            {user?.avatarUrl && (
                                <img
                                    src={user.avatarUrl}
                                    alt="Profile"
                                    className="nav-avatar"
                                />
                            )}
                            <Link to="/profile" className="nav-link" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                        </div>
                        {user && user?.role >= 1 && (
                            <Link to="/profile/orders" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
                        )}
                        {user && user?.role >= 1 && (
                            <Link to="/admin" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
                        )}
                        {!user?.emailVerified && (
                            <Link to="/verify/resend" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Resend Verification</Link>
                        )}
                        <button className="btn btn-secondary logout-btn" onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                        }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                        <Link to="/register" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    )
}
