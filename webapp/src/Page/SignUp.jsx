import { useState } from 'react';
import Footer from '../Components/Footer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import * as z from 'zod';
import FreelancerIconSVG from '../Public/freelancer.svg';
import ClientIconSVG from '../Public/customer.svg';

const signupSchema = z.object({
    fullName: z.string().min(1, "Please fill in this field."),
    email: z.email("Invalid email address. Please try again")
            .min(1, "Please fill in the field.")
            .max(255, "This field cannot exceed 255 characters."),
    password: z.string().min(8, "Password must have at least 8 characters.")
        .max(255, "This field cannot exceed 255 characters.")
        .regex(/[0-9]/, "Password must have at least 1 number")
        .regex(/[A-Z]/, "Password must have at least 1 capital letter.")
        .regex(/[a-z]/, "Password must have at least 1 non-capital letter.")
        .regex(/[\W_]/, "Password must have at least 1 special letter."),
    confirmedPassword: z.string().min(1, "Please confirm your password."),
    role: z.enum(['freelancer', 'client'], { required_error: 'Please select a role.' })
}).refine(data => data.password === data.confirmedPassword, {
    message: "Your confirmed password does not match.",
    path: ["confirmedPassword"]
});


export default function SignUp() {
    const [serverMessage, setServerMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        resolver: zodResolver(signupSchema),
        mode: "onChange"
    });
    
    const selectedRole = watch('role');

    const onSubmit = (data) => {
        console.log("Logged validated data: ", data);
        setServerMessage("Something went wrong. Please try again.");
    };

    return (
        <div className="font-poppins flex flex-col min-h-screen">
            <div className="w-full max-w-2xl mx-auto py-12 px-4">
                <h1 className='font-lora text-[40px] text-center font-bold mb-8'>
                    Be a part of our community now
                </h1>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button type="button" onClick={() => setValue('role', 'freelancer', { shouldValidate: true })}
                                className={`flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-all ${selectedRole === 'freelancer' ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}>
                                <img src={FreelancerIconSVG} alt="Freelancer" className="h-10 w-10 mb-2" />
                                <span className="font-semibold text-lg">I am a freelancer.</span>
                            </button>
                            <button type="button" onClick={() => setValue('role', 'client', { shouldValidate: true })}
                                className={`flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-all ${selectedRole === 'client' ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}>
                                 <img src={ClientIconSVG} alt="Client" className="h-10 w-10 mb-2" />
                                <span className="font-semibold text-lg">I am a client.</span>
                            </button>
                        </div>
                         {errors.role && <p className="mt-2 text-sm text-red-600 text-center">{errors.role.message}</p>}
                         <input type="hidden" {...register('role')} />
                    </div>
                    {serverMessage && (
                        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                            {serverMessage}
                        </div>
                    )}
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input 
                            id="fullName" 
                            type="text" 
                            maxLength={255}
                            {...register("fullName")} 
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`} 
                            />
                        {errors.fullName && <p className="mt-2 text-sm text-red-600">{errors.fullName.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            id="email" 
                            type="email" 
                            maxLength={255}
                            {...register("email")} 
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black ${errors.email ? 'border-red-500' : 'border-gray-300'}`} 
                            placeholder="you@example.com"
                            />
                        {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <div className="mt-1 relative">
                            <input 
                                id="password" 
                                type={showPassword ? "text" : "password"} 
                                maxLength={255}
                                {...register("password")} 
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black ${errors.password ? 'border-red-500' : 'border-gray-300'}`} 
                                placeholder="Ex@mp1es"
                                />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    {showPassword ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L12 12" /> : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>}
                                </svg>
                            </button>
                        </div>
                        {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
                    </div>

                     <div>
                        <label htmlFor="confirmedPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <div className="mt-1 relative">
                            <input 
                                id="confirmedPassword" 
                                type={showConfirmPassword ? "text" : "password"} 
                                maxLength={255}
                                {...register("confirmedPassword")} 
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black ${errors.confirmedPassword ? 'border-red-500' : 'border-gray-300'}`} />
                             <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    {showConfirmPassword ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L12 12" /> : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>}
                                </svg>
                            </button>
                        </div>
                        {errors.confirmedPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmedPassword.message}</p>}
                    </div>
                    <div>
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                            Create Account
                        </button>
                    </div>
                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/SignInPage" className="font-medium text-black hover:text-gray-700">
                            Sign In
                        </Link>
                    </p>
                </form>
            </div>
            <Footer />
        </div>
    );
}
