import Footer from '../Components/Footer';
import SignInBg from '../Public/signin_bg.jpg';

export default function SignIn() {
    return (
        <div className="font-poppins flex flex-col min-h-screen">
            <div className="flex-grow flex flex-col md:flex-row">
                <div
                    className="w-full md:w-2/3 relative min-h-screen"
                    style={{
                        backgroundImage: `url(${SignInBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-12">
                        <h1 className="font-lora text-white text-[50px] text-center font-bold">
                            Find, connect and work together
                        </h1>
                    </div>
                </div>
                <div className="w-full md:w-1/3 flex items-center justify-center p-4 py-16">
                    <div className="w-full max-w-md mx-auto p-8 border rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-center">Đăng nhập</h2>
                        <p className="mt-4 text-center">Form của bạn sẽ nằm ở đây...</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}