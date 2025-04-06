import {Link} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'

export default function Navbar() {
    const {user, logout, isAuthenticated} = useAuth()

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="logo">StuCo</Link>
            </div>

            <div className="navbar-right">
                <Link to="/news" className="nav-link">News</Link>
                <Link to="/store" className="nav-link">Store</Link>

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
                            <Link to="/profile" className="nav-link">My Profile</Link>
                        </div>
                        {user && user?.role >= 1 && (
                            <Link to="/profile/orders" className="nav-link">Orders</Link>
                        )}
                        {user && user?.role >= 2 && (
                            <Link to="/admin" className="nav-link">Admin</Link>
                        )}
                        {!user?.emailVerified && (
                            <Link to="/verify/resend" className="nav-link">Resend Verification</Link>
                        )}
                        <button className="btn btn-secondary logout-btn" onClick={logout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="nav-link">Register</Link>
                    </>
                )}
            </div>
        </nav>
    )
}
