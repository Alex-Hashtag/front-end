import {ChangeEvent, FormEvent, useState} from 'react'
import {useNavigate} from 'react-router-dom'

export default function Register() {
    useNavigate();

    const [email, setEmail] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [avatarFile, setAvatarFile] = useState<File | null>(null)

    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [loading, setLoading] = useState(false) // new state for button disabled

    const validatePassword = (pwd: string) => {
        return pwd.length >= 8 && /[A-Z]/.test(pwd) && /\d/.test(pwd)
    }

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0)
        {
            setAvatarFile(e.target.files[0])
        }
    }

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        if (password !== confirmPassword)
        {
            setError('Passwords do not match')
            return
        }

        if (!validatePassword(password))
        {
            setError('Password must be at least 8 characters long, contain an uppercase letter and a digit.')
            return
        }

        const userJson = JSON.stringify({
            email,
            firstName,
            lastName,
            password,
        })
        const formData = new FormData()
        formData.append('user', new Blob([userJson], {type: 'application/json'}))
        if (avatarFile)
        {
            formData.append('avatar', avatarFile)
        }

        setLoading(true) // disable the button
        try
        {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok)
            {
                const msg = await response.text()
                throw new Error(msg)
            }

            const msg = await response.text()
            setSuccess(msg)
        } catch (err: unknown)
        {
            setError(err instanceof Error ? err.message : 'An unknown error occurred')
        } finally
        {
            setLoading(false) // re-enable the button regardless of outcome
        }
    }

    return (
        <div className="container">
            <form className="auth-form" onSubmit={handleRegister}>
                <h2>Register</h2>
                {error && <p className="form-error">{error}</p>}
                {success && <p className="form-success">{success}</p>}
                <div className="form-group">
                    <label>Email (@acsbg.org):</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>First Name:</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Last Name:</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
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
                <div className="form-group">
                    <label>Profile Picture (optional):</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                    />
                </div>
                <button className="btn" type="submit" disabled={loading}>
                    {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
                <div className="extra-link">
                    <span>
                        Already have an account? <a href="/login">Log In</a>
                    </span>
                </div>
            </form>
        </div>
    )
}
