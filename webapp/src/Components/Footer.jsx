export default function Footer() {
    return (
        <div className="bg-black text-white py-12">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-start gap-8">
                    <div className="w-1/4">
                        <div className="font-bold text-[20px] text-gray-500 mb-4">
                            For clients
                        </div>
                        {["How to hire", "Freelancer Marketplace", "Project Catalog", "Enterprise"].map((item) => (
                            <button
                                key={item}
                                className="block text-[16px] mb-2 relative after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-300 after:ease-in-out hover:after:left-0 hover:after:w-full"
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                    <div className="w-1/4">
                        <div className="font-bold text-[20px] text-gray-500 mb-4">
                            For freelancers
                        </div>
                        {["Find work", "My proposals", "Contracts", "Freelancer Plus"].map((item) => (
                            <button
                                key={item}
                                className="block text-[16px] mb-2 relative after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-300 after:ease-in-out hover:after:left-0 hover:after:w-full"
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                    <div className="w-1/4">
                        <div className="font-bold text-[20px] text-gray-500 mb-4">
                            Resources
                        </div>
                        {["Help & Support", "Community", "Blog", "Guides"].map((item) => (
                            <button
                                key={item}
                                className="block text-[16px] mb-2 relative after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-300 after:ease-in-out hover:after:left-0 hover:after:w-full"
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                    <div className="w-1/4">
                        <div className="font-bold text-[20px] text-gray-500 mb-4">
                            Developing Team
                        </div>
                        {["Frontend", "Backend", "UI/UX", "Database"].map((item) => (
                            <button
                                key={item}
                                className="block text-[16px] mb-2 relative after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-300 after:ease-in-out hover:after:left-0 hover:after:w-full"
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}