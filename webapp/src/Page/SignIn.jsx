import { useState } from 'react';
import Footer from '../Components/Footer';
import SignInBg from '../Public/signin_bg.jpg';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom'
import * as z from 'zod';
import useAuth from '../ContextAPI/UseAuth';

const signinSchema = z.object({
    email: z.email("Invalid email address. Please try again")
        .min(1, "Please fill in the field.")
        .max(255, "This field cannot exceed 255 characters."),
    password: z.string().min(8, "Password must have at least 8 characters.")
        .max(255, "This field cannot exceed 255 characters.")
        .regex(/[0-9]/, "Password must have at least 1 number")
        .regex(/[A-Z]/, "Password must have at least 1 capital letter.")
        .regex(/[a-z]/, "Password must have at least 1 non-capital letter.")
        .regex(/[\W_]/, "Password must have at least 1 special letter.")
})

export default function SignIn() {
    const [serverMsg, setServerMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(signinSchema),
        mode: "onChange"
    });
    const { signIn } = useAuth();
    const onSubmit = async (data) => {
        try {
            const res = await fetch('http://localhost:3000/api/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password
                })
            });
            const result = await res.json();

            if (res.ok && result.token) {
                signIn(result.token);
            } else {
                setServerMessage({
                    type: "error",
                    text: result.message || result.error || "Sign-in failed. Please check your email and password."
                });
            }
        } catch (error) {
            console.error("Fetch error:", error); // Thêm console.error để debug dễ hơn
            setServerMessage({ type: "error", text: "Could not connect to the server. Please try again later." })
        }
    };

    return (
        <div className="font-poppins flex flex-col min-h-screen">
            <div className="flex-grow flex flex-col md:flex-row">
                <div className="w-full md:w-2/3 relative min-h-screen" style={{ backgroundImage: `url(${SignInBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-12">
                        <h1 className="font-lora text-white text-[50px] text-center font-bold">
                            Find, connect and work together
                        </h1>
                    </div>
                </div>
                <div className="w-full md:w-1/3 flex items-start justify-center p-4 py-16">
                    <div className="w-full max-w-md mx-auto p-8 ">
                        <h2 className="text-2xl font-bold text-center">Sign In to VIETLANCER</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className='mt-8 space-y-6'>
                            {serverMsg && (
                                <div
                                    className={`p-3 text-sm rounded-lg ${serverMsg.type === 'success'
                                        ? 'text-green-700 bg-green-100'
                                        : 'text-red-700 bg-red-100'
                                        }`}
                                    role="alert"
                                >
                                    {serverMsg.text}
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        type="email"
                                        maxLength={255}
                                        {...register("email")}
                                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        maxLength={255}
                                        {...register("password")}
                                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L12 12" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>
                            <div className="flex items-center justify-end">
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-black hover:text-gray-700">
                                        Forgot your password?
                                    </a>
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                >
                                    Sign In
                                </button>
                            </div>
                            <p className="mt-4 text-center text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link to="/SignUpPage" className="font-medium text-black hover:text-gray-700">
                                    Sign up here
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div >
    );
}