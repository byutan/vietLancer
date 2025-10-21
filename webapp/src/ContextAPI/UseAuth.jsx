import { useContext } from 'react';
import AuthContent from './AuthContext';

export default function useAuth() {
    return useContext(AuthContent);
}