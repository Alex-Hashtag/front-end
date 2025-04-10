import { FormEvent, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function ResetPassword() {
    const navigate = useNavigate()
    const location = useLocation()
    const [token, setToken] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    useEffect(() => {
        // Extract token from URL query parameters
        const searchParams = new URLSearchParams(location.search)
        const tokenParam = searchParams.get('token')
        if (tokenParam) {
            setToken(tokenParam)
        } else {
            setError('Invalid or missing reset token')
        }
    }, [location])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setIsSubmitting(true)
        console.log('Submitting password reset with token:', token)

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })

            console.log('Response status:', response.status)
            
            // Read the response text regardless of success/failure for debugging
            const responseText = await response.text()
            console.log('Response text:', responseText)
            
            if (!response.ok) {
                throw new Error(responseText || 'Failed to reset password')
            }

            setSuccess('Your password has been reset successfully')
            
            // Redirect to login page after successful reset
            setTimeout(() => {
                navigate('/login')
            }, 3000)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Reset Password</h2>
                {error && <p className="form-error">{error}</p>}
                {success && <p className="form-success">{success}</p>}
                
                <div className="form-group">
                    <label>New Password:</label>
                    <div className="password-input-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="At least 8 characters with uppercase & number"
                        />
                        <button 
                            type="button" 
                            className="password-toggle-btn"
                            onMouseDown={() => setShowPassword(true)}
                            onMouseUp={() => setShowPassword(false)}
                            onMouseLeave={() => setShowPassword(false)}
                            onTouchStart={() => setShowPassword(true)}
                            onTouchEnd={() => setShowPassword(false)}
                            onTouchCancel={() => setShowPassword(false)}
                        >
                            Show
                        </button>
                    </div>
                </div>
                
                <div className="form-group">
                    <label>Confirm Password:</label>
                    <div className="password-input-container">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button 
                            type="button" 
                            className="password-toggle-btn"
                            onMouseDown={() => setShowConfirmPassword(true)}
                            onMouseUp={() => setShowConfirmPassword(false)}
                            onMouseLeave={() => setShowConfirmPassword(false)}
                            onTouchStart={() => setShowConfirmPassword(true)}
                            onTouchEnd={() => setShowConfirmPassword(false)}
                            onTouchCancel={() => setShowConfirmPassword(false)}
                        >
                            Show
                        </button>
                    </div>
                </div>
                
                <button 
                    className="btn" 
                    type="submit" 
                    disabled={isSubmitting || !token}
                >
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
                
                <div className="extra-link">
                    <span>
                        Remember your password? <a href="/login">Login here</a>
                    </span>
                </div>
            </form>
        </div>
    )
}
