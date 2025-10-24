import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EmailVerification({ email, onSuccess, onCancel }) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(300);

    useEffect(() => {
        if (timer <= 0) return;
        const intervalId = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timer]);

    const sendVerificationCode = async () => {
        setError('');
        setResendLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:3000/api/send-verification-code',
                { target: email },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            console.log('SENT');
            if (response.status === 200) {
                setTimer(300);
            }
        } catch (err) {
            console.error("Error sending verification code:", err.response?.data || err.message);
            setError(err.response?.data?.error || 'Failed to send verification code. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleConfirmCode = async () => {
    if (isLoading || code.length !== 6 || timer <= 0) return;
    
    setError('');
    setIsLoading(true);
    
    try {
            const token = localStorage.getItem('token');
            const userEmail = email;  

            const response = await axios.post('http://localhost:3000/api/confirm-verification-code',
                { email: userEmail, code }, 
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            if (onSuccess) onSuccess(response.data); 

        } catch (err) {
            setError(err.response?.data?.error || 'Incorrect code or code expired. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return (
        <div className="space-y-3 font-poppins">
            <p className="text-sm text-gray-700">
                Enter the 6-digit verification code sent to {email}.
            </p>
            <div>
                <label htmlFor="verification-code" className="sr-only">Verification Code</label>
                <input
                    type="text"
                    id="verification-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    required
                    pattern="\d{6}"
                    inputMode="numeric"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm disabled:opacity-50"
                    placeholder="Enter code (6 digits)"
                    disabled={isLoading || resendLoading || timer <= 0}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmCode(); }}
                />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex items-center justify-between pt-1">
                <p className={`text-sm font-medium ${timer <= 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {timer > 0
                        ? `Code expires in ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
                        : 'Code expired'}
                </p>
                <div className="flex space-x-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading || resendLoading}
                            className="inline-flex items-center justify-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={sendVerificationCode}
                        disabled={isLoading || resendLoading}
                        className="inline-flex items-center justify-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                    >
                        {resendLoading ? 'Sending...' : 'Resend Code'}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmCode}
                        disabled={isLoading || resendLoading || code.length !== 6 || timer <= 0}
                        className="inline-flex items-center justify-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                    >
                        {isLoading ? 'Verifying...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}