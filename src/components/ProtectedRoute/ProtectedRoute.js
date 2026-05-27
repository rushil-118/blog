import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/authContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, authLoading } = useAuthContext();
    const location = useLocation();

    if(authLoading){
        return <div className="container py-7">Checking authentication...</div>;
    }

    if(!isAuthenticated){
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
}

export default ProtectedRoute;
