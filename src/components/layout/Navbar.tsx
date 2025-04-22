import {Link} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'
import {useEffect, useRef, useState} from 'react'
import ThemeToggle from '../common/ThemeToggle'

export default function Navbar() {
    const {user, logout, isAuthenticated} = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const navbarRef = useRef<HTMLElement>(null)
    const profileMenuRef = useRef<HTMLDivElement>(null)

    // Handle scrolling effects
    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY
            if (offset > 50)
            {
                setScrolled(true)
            } else
            {
                setScrolled(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navbarRef.current && !navbarRef.current.contains(event.target as Node) && mobileMenuOpen)
            {
                setMobileMenuOpen(false)
            }

            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node) && profileMenuOpen)
            {
                setProfileMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [mobileMenuOpen, profileMenuOpen])

    // Close mobile menu when screen size changes to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768 && mobileMenuOpen)
            {
                setMobileMenuOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [mobileMenuOpen])

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen)
    }

    const toggleProfileMenu = () => {
        setProfileMenuOpen(!profileMenuOpen)
    }

    // Close mobile menu when navigating
    const closeMenu = () => {
        setMobileMenuOpen(false)
        setProfileMenuOpen(false)
    }

    return (
        <nav ref={navbarRef} className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-left">
                    <Link to="/" className="logo" onClick={closeMenu}>
                        <span className="logo-text">ACS</span>
                        <span className="logo-highlight">StuCo</span>
                    </Link>
                </div>

                <div className="navbar-center">
                    <div className="primary-nav">
                        <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
                        <Link to="/news" className="nav-link" onClick={closeMenu}>News</Link>
                        <Link to="/store" className="nav-link" onClick={closeMenu}>Store</Link>
                        {isAuthenticated && user?.role !== undefined && user.role >= 1 && (
                            <Link to="/admin" className="nav-link" onClick={closeMenu}>Admin</Link>
                        )}
                    </div>
                </div>

                <div className="navbar-right">
                    <div className="nav-theme-toggle">
                        <ThemeToggle/>
                    </div>

                    {isAuthenticated ? (
                        <div className="profile-section" ref={profileMenuRef}>
                            <button
                                className="profile-button"
                                onClick={toggleProfileMenu}
                                aria-expanded={profileMenuOpen}
                                aria-label="User profile menu"
                            >
                                <div className="avatar-wrapper">
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="" className="profile-avatar"/>
                                    ) : (
                                        <span className="profile-initial">
                                            {user?.name?.charAt(0) || 'U'}
                                        </span>
                                    )}
                                </div>
                            </button>

                            {profileMenuOpen && (
                                <div className="profile-dropdown">
                                    <div className="profile-dropdown-header">
                                        <div className="dropdown-user-info">
                                            <strong className="dropdown-user-name">{user?.name || 'User'}</strong>
                                            <span className="dropdown-user-email">{user?.email}</span>
                                        </div>
                                    </div>

                                    <div className="profile-dropdown-links">
                                        <Link to="/profile" className="dropdown-link" onClick={closeMenu}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                 strokeLinejoin="round">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                            My Profile
                                        </Link>

                                        {user && user?.role !== undefined && user.role >= 1 && (
                                            <Link to="/profile/orders" className="dropdown-link" onClick={closeMenu}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                     strokeLinejoin="round">
                                                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                                    <path d="M2 17l10 5 10-5"></path>
                                                    <path d="M2 12l10 5 10-5"></path>
                                                </svg>
                                                My Orders
                                            </Link>
                                        )}

                                        {!user?.emailVerified && (
                                            <Link to="/verify/resend" className="dropdown-link" onClick={closeMenu}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                     strokeLinejoin="round">
                                                    <polyline points="9 11 12 14 22 4"></polyline>
                                                    <path
                                                        d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                                </svg>
                                                Verify Email
                                            </Link>
                                        )}
                                    </div>

                                    <div className="profile-dropdown-footer">
                                        <button
                                            className="logout-button"
                                            onClick={() => {
                                                logout();
                                                closeMenu();
                                            }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                 strokeLinejoin="round">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                                <polyline points="16 17 21 12 16 7"></polyline>
                                                <line x1="21" y1="12" x2="9" y2="12"></line>
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="login-button" onClick={closeMenu}>Login</Link>
                            <Link to="/register" className="register-button" onClick={closeMenu}>Register</Link>
                        </div>
                    )}

                    <button
                        className="mobile-menu-btn"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle mobile menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        <span className={`menu-icon ${mobileMenuOpen ? 'active' : ''}`}>
                            <span className="bar"></span>
                            <span className="bar"></span>
                            <span className="bar"></span>
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`navbar-mobile ${mobileMenuOpen ? 'active' : ''}`}>
                <div className="mobile-menu-content">
                    {/* Main navigation - for mobile */}
                    <div className="mobile-section">
                        <h3 className="mobile-section-title">Navigate</h3>
                        <Link to="/" className="mobile-nav-link" onClick={closeMenu}>Home</Link>
                        <Link to="/news" className="mobile-nav-link" onClick={closeMenu}>News</Link>
                        <Link to="/store" className="mobile-nav-link" onClick={closeMenu}>Store</Link>
                        {isAuthenticated && user?.role !== undefined && user.role >= 1 && (
                            <Link to="/admin" className="mobile-nav-link" onClick={closeMenu}>Admin Panel</Link>
                        )}
                    </div>

                    {/* Authentication section - for mobile */}
                    {isAuthenticated ? (
                        <div className="mobile-section">
                            <h3 className="mobile-section-title">Your Account</h3>
                            <div className="user-info">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Profile" className="mobile-avatar"/>
                                ) : (
                                    <div className="mobile-avatar-placeholder">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <div className="user-details">
                                    <span className="user-name">{user?.name || 'User'}</span>
                                    <span className="user-email">{user?.email}</span>
                                </div>
                            </div>

                            <div className="mobile-nav-links">
                                <Link to="/profile" className="mobile-nav-link" onClick={closeMenu}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    My Profile
                                </Link>

                                {user && user?.role !== undefined && user.role >= 1 && (
                                    <Link to="/profile/orders" className="mobile-nav-link" onClick={closeMenu}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                             strokeLinejoin="round">
                                            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                            <path d="M2 17l10 5 10-5"></path>
                                            <path d="M2 12l10 5 10-5"></path>
                                        </svg>
                                        My Orders
                                    </Link>
                                )}

                                {!user?.emailVerified && (
                                    <Link to="/verify/resend" className="mobile-nav-link" onClick={closeMenu}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                             strokeLinejoin="round">
                                            <polyline points="9 11 12 14 22 4"></polyline>
                                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                        </svg>
                                        Verify Email
                                    </Link>
                                )}
                            </div>

                            <button
                                className="mobile-button mobile-logout-btn"
                                onClick={() => {
                                    logout();
                                    closeMenu();
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="mobile-section">
                            <h3 className="mobile-section-title">Join Us</h3>
                            <div className="mobile-auth-buttons">
                                <Link to="/login" className="mobile-button mobile-login-btn" onClick={closeMenu}>
                                    Login
                                </Link>
                                <Link to="/register" className="mobile-button mobile-register-btn" onClick={closeMenu}>
                                    Register
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="mobile-section">
                        <h3 className="mobile-section-title">Theme</h3>
                        <div className="mobile-theme-toggle">
                            <ThemeToggle/>
                            <span className="theme-label">Toggle dark mode</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}
