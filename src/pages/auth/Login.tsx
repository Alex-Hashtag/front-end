import {FormEvent, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'

export default function Login() {
    const navigate = useNavigate()
    const {refreshUser} = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)

        try
        {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password}),
            })

            if (!response.ok)
            {
                const msg = await response.text()
                throw new Error(msg)
            }

            const data = await response.json()
            localStorage.setItem('token', data.token)

            await refreshUser()

            navigate('/')
        } catch (err: any)
        {
            setError(err.message)
        }
    }

    return (
        <div className="container">
            <form className="auth-form" onSubmit={handleLogin}>
                <h2>Login</h2>
                {error && <p className="form-error">{error}</p>}
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <div className="password-input-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
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
                <button className="btn" type="submit">Log In</button>
                <div className="extra-link">
          <span>
            Don’t have an account? <a href="/register">Register here</a>
          </span>
                </div>
                <div className="extra-link">
          <span>
            Forgot your password? <a href="/forgot-password">Reset it here</a>
          </span>
                </div>
            </form>
        </div>
    )
}
