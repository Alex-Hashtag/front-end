import {FormEvent, useState} from 'react'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setIsSubmitting(true)

        console.log('Submitting forgot password request for:', email)

        try
        {
            // Using the exact same pattern as the working Login component
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email}),
            })

            console.log('Response status:', response.status)

            // Read the response text regardless of success/failure for debugging
            const responseText = await response.text()
            console.log('Response text:', responseText)

            if (!response.ok)
            {
                throw new Error(responseText || 'Failed to send password reset request')
            }

            setSuccess('Password reset instructions have been sent to your email.')
            setEmail('')
        } catch (err: any)
        {
            console.error('Forgot password error:', err)
            setError(err.message || 'Failed to send password reset request. Please try again.')
        } finally
        {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Forgot Password</h2>
                {error && <p className="form-error">{error}</p>}
                {success && <p className="form-success">{success}</p>}
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button className="btn" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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
