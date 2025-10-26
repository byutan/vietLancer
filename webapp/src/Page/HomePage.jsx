import WebDevIcon from '../Public/web_dev.svg'
import MobileDevIcon from '../Public/mobile_dev.svg'
import EmbeddedDevIcon from '../Public/embedded_dev.svg'
import QADevIcon from '../Public/qa.svg'
import UIUXIcon from '../Public/ui_ux.png'
import PMIcon from '../Public/project_management.svg'
import DevOpsIcon from '../Public/dev_ops.svg'
import SecurityIcon from '../Public/security.svg'
import Footer from '../Components/Footer'
import WindowSlide1 from '../Public/hp_slide_window1.jpg'
import WindowSlide2 from '../Public/hp_slide_window2.jpg'
import WindowSlide3 from '../Public/hp_slide_window3.jpg'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const navigate = useNavigate();
    const jobCategories = [
        { name: "Web development", icon: WebDevIcon },
        { name: "Mobile development", icon: MobileDevIcon },
        { name: "Embedded Engineering", icon: EmbeddedDevIcon },
        { name: "UI/UX Design", icon: UIUXIcon },
        { name: "Quality Assurance", icon: QADevIcon },
        { name: "Project Management", icon: PMIcon },
        { name: "DevOps Engineering", icon: DevOpsIcon },
        { name: "Digital Security", icon: SecurityIcon },
    ];
    const slides = [
        {
            image: WindowSlide1,
            caption: "Where Talent Meets Opportunity"
        },
        {
            image: WindowSlide2,
            caption: "Powering Meaningful Collaboration"
        },
        {
            image: WindowSlide3,
            caption: "From Vision to Reality"
        }
    ];
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide(prevSlide => (prevSlide + 1) % slides.length);
        }, 7000);
        return () => {
            clearInterval(slideInterval);
        };
    }, [slides.length]);

    const handleCategoryClick = (categoryName) => {
        const encoded = encodeURIComponent(categoryName);
        navigate(`/JobPage/${encoded}`); 
        window.scrollTo(0, 0);
    };
    return (
        <div className="font-poppins">
            <div className="relative overflow-hidden h-[60vh]">
                <div
                    className="flex h-full transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {slides.map((slide, index) => (
                        <div key={index} className="w-full h-full flex-shrink-0 relative">
                            <img
                                src={slide.image}
                                alt={`Slide ${index + 1}`}
                                className="w-full h-full flex-shrink-0 object-cover"
                            />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white w-full px-4">
                                <h2 className="font-lora text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-md">
                                    {slide.caption}
                                </h2>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white scale-110' : 'bg-gray-400/70 hover:bg-white'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center pt-12 border-b pb-4">
                    <div className="text-[40px] font-bold">
                        <span className="relative inline-block group">
                            Empowering freelancers and clients to
                            <span className="absolute bottom-0 left-0 block w-0 h-[4px] bg-black transition-all duration-500 group-hover:w-full"></span>
                        </span>
                        <br />
                        <span className="relative inline-block group py-1">
                            collaborate, create, and grow.
                            <span className="absolute bottom-0 left-0 block w-0 h-[4px] bg-black transition-all duration-500 group-hover:w-full"></span>
                        </span>
                    </div>
                    <div className="flex space-x-4 flex-shrink-0">
                        <button className="text-[16px] text-white bg-black rounded border-[2px] border-black py-4 px-4 transition-colors hover:bg-gray-500">
                            Hire freelancer
                        </button>
                        <button className="text-[16px] rounded border-[2px] border-black py-4 px-4 transition-colors hover:bg-gray-200">
                            Browse jobs
                        </button>
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-4 mb-20">
                <div className="flex justify-between items-center mt-20 pb-4">
                    <div className="text-[30px] font-bold">
                        Explore endless professional possibilities
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                    {jobCategories.map((category) => (
                        <button
                            key={category.name}
                            onClick={() => handleCategoryClick(category.name)} // 👈 thêm event click
                            className="block w-full p-6 text-left font-bold text-lg border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200">
                            <div className="flex flex-col items-center space-x-3">
                                {category.icon && (
                                    <img
                                        src={category.icon}
                                        alt={`${category.name} icon`}
                                        className="w-8 h-8"
                                    />
                                )}
                                <span>{category.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    )
}