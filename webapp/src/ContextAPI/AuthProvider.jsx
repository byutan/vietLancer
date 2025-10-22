import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import AuthContext from './AuthContext';

function decodeJwtPayload(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '='));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const jsonPayload = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(jsonPayload);
}

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = decodeJwtPayload(token); 
                setUser( payload );
            } catch {
                localStorage.removeItem("token");
            }
        }
    }, []);

    const signIn = (token) => {
        try {
            localStorage.setItem("token", token);
            const payload = decodeJwtPayload(token); 
            setUser( payload );
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