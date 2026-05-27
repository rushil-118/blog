import { createContext, useCallback, useContext, useMemo, useState } from "react";
import authApi from "../services/authApi";

export const AUTH_TOKEN_KEY = 'blogAuthToken';
export const AUTH_USER_KEY = 'blogAuthUser';

const readStoredUser = () => {
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    if(!storedUser) return null;

    try{
        return JSON.parse(storedUser);
    } catch(err){
        localStorage.removeItem(AUTH_USER_KEY);
        return null;
    }
}

const AuthContext = createContext({});

export const AuthProvider = ({children}) => {
    const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY));
    const [user, setUser] = useState(() => readStoredUser());
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    const persistAuth = useCallback((authData) => {
        const nextToken = authData?.token || '';
        const nextUser = authData?.user || null;

        if(nextToken){
            localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
        } else {
            localStorage.removeItem(AUTH_TOKEN_KEY);
        }

        if(nextUser){
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
        } else {
            localStorage.removeItem(AUTH_USER_KEY);
        }

        setToken(nextToken || null);
        setUser(nextUser);
        return { token: nextToken, user: nextUser };
    }, []);

    const login = useCallback(async(credentials) => {
        setAuthLoading(true);
        setAuthError('');
        try{
            const data = await authApi.login({
                username: credentials.username,
                password: credentials.password
            });
            return persistAuth(data);
        } catch(err){
            const message = err?.response?.data?.message || 'Unable to log in';
            setAuthError(message);
            throw err;
        } finally {
            setAuthLoading(false);
        }
    }, [persistAuth]);

    const register = useCallback(async(details) => {
        setAuthLoading(true);
        setAuthError('');
        try{
            const data = await authApi.register(details);
            return persistAuth(data);
        } catch(err){
            const message = err?.response?.data?.message || 'Unable to register';
            setAuthError(message);
            throw err;
        } finally {
            setAuthLoading(false);
        }
    }, [persistAuth]);

    const logout = useCallback(() => {
        persistAuth({ token: null, user: null });
        setAuthError('');
    }, [persistAuth]);

    const refreshMe = useCallback(async() => {
        if(!localStorage.getItem(AUTH_TOKEN_KEY)) return null;

        setAuthLoading(true);
        setAuthError('');
        try{
            const data = await authApi.me();
            const refreshedUser = data?.user || null;
            if(refreshedUser){
                localStorage.setItem(AUTH_USER_KEY, JSON.stringify(refreshedUser));
                setUser(refreshedUser);
            }
            return refreshedUser;
        } catch(err){
            logout();
            const message = err?.response?.data?.message || 'Session expired';
            setAuthError(message);
            throw err;
        } finally {
            setAuthLoading(false);
        }
    }, [logout]);

    const value = useMemo(() => ({
        user,
        token,
        isAuthenticated: Boolean(token && user),
        authLoading,
        authError,
        login,
        register,
        logout,
        refreshMe
    }), [user, token, authLoading, authError, login, register, logout, refreshMe]);

    return (
        <AuthContext.Provider value = {value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => useContext(AuthContext);

export default AuthContext;
