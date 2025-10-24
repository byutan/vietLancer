import { useState } from 'react';
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
const getInitialUser = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        return null;
    }

    try {
        const payload = decodeJwtPayload(token);
        if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem("token"); 
            return null;
        }
        
        return payload; 
    } catch {
        localStorage.removeItem("token");
        return null;
    }
};

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(getInitialUser); 
    const navigate = useNavigate();

    const signIn = (token) => {
        try {
            const payload = decodeJwtPayload(token);
            if (payload.exp * 1000 < Date.now()) {
                 localStorage.removeItem("token");
                 setUser(null);
                 alert("Token is expired."); 
                 return; 
            }

            localStorage.setItem("token", token);
            setUser(payload);
            navigate('/HomePage');
        } catch {
            localStorage.removeItem("token");
            setUser(null);
        }
    };

    const signOut = () => {
        setUser(null);
        localStorage.removeItem("token");
        navigate('/SignInPage', { replace: true });
    };
    
    return (
        <AuthContext.Provider value={{ user, setUser, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}