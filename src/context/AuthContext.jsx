import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('farmstay_token'));
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const res = await api.get('/auth/me');
            setAdmin(res.data.data);
        } catch {
            localStorage.removeItem('farmstay_token');
            setToken(null);
            setAdmin(null);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token: newToken, admin: adminData } = res.data.data;
        localStorage.setItem('farmstay_token', newToken);
        setToken(newToken);
        setAdmin(adminData);
        return adminData;
    };

    const logout = () => {
        localStorage.removeItem('farmstay_token');
        setToken(null);
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ admin, token, loading, login, logout, isAuthenticated: !!admin }}>
            {children}
        </AuthContext.Provider>
    );
};