import Footer from "../Components/Footer";
import { useContext, useEffect, useState } from 'react'; // Bạn có thể cần useState
import { useNavigate } from 'react-router-dom';
import AuthContext from '../ContextAPI/AuthContext';

export default function ApproveRequest() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isVerified, setIsVerified] = useState(false); 

    useEffect(() => {
        if (!user) {
            navigate('/SignInPage'); 
        } else if (user.role !== 'moderator') {
            navigate('/HomePage'); 
        } else {
            setIsVerified(true);
        }
    }, [user, navigate]);
    if (!isVerified) {
        return null; 
    }
    return (
        <div className="font-poppins">
            <h2>Approve Requests (Moderator Only)</h2>
            <Footer/>
        </div>
    )
}