import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import hook điều hướng
import AuthContext from './AuthContext';

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                setUser({ role: payload.role });
            } catch {
                localStorage.removeItem("token");
            }
        }
    }, []);

    const signIn = (token) => {
        try {
            localStorage.setItem("token", token);
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUser({ role: payload.role });
            navigate('/HomePage');
        } catch {
            localStorage.removeItem("token");
            setUser(null);
        }
    };

    const signOut = () => {
        setUser(null);
        localStorage.removeItem("token");
        navigate('/SignInPage');
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}