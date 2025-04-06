import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'

export default function VerifyEmail() {
    const {token} = useParams()
    const navigate = useNavigate()
    const [message, setMessage] = useState('Verifying your email...')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function verify()
        {
            if (!token) return
            try
            {
                const res = await fetch(`/api/auth/verify/${token}`)
                if (!res.ok)
                {
                    const txt = await res.text()
                    throw new Error(txt)
                }
                const successMsg = await res.text()
                setMessage(successMsg)
            } catch (err: any)
            {
                setError(err.message)
            }
        }

        verify()
    }, [token])

    return (
        <div className="container">
            <h2>Email Verification</h2>
            {error ? (
                <p style={{color: 'crimson'}}>{error}</p>
            ) : (
                <p>{message}</p>
            )}
            <button className="btn" onClick={() => navigate('/login')}>Go to Login</button>
        </div>
    )
}
