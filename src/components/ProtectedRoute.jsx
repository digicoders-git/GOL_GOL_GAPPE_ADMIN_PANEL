import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Normalize: Treat 'admin' as 'super_admin'
    const role = user.role === 'admin' ? 'super_admin' : user.role;

    if (!token) {
        // Redirect to appropriate login page
        const loginPath = user.role === 'user' ? '/user-login' : '/login';
        return <Navigate to={loginPath} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect to role-specific dashboard
        const redirectPath = role === 'user' ? '/user-dashboard' : '/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;