import {useAuth} from '../../context/AuthContext';
import {Navigate} from 'react-router-dom';

interface ProtectedRouteProps
{
    children: React.ReactNode;
    requiredRole: number;
}

export default function ProtectedRoute({children, requiredRole}: ProtectedRouteProps) {
    const {user} = useAuth();

    if (!user || user.role < requiredRole)
    {
        return <Navigate to="/" replace/>;
    }

    return <>{children}</>;
}