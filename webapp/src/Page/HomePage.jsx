import WebDevIcon from '../Public/web_dev.svg'
import MobileDevIcon from '../Public/mobile_dev.svg'
import EmbeddedDevIcon from '../Public/embedded_dev.svg'
import QADevIcon from '../Public/qa.svg'
import UIUXIcon from '../Public/ui_ux.png'
import PMIcon from '../Public/project_management.svg'
import DevOpsIcon from '../Public/dev_ops.svg'
import SecurityIcon from '../Public/security.svg'
import Footer from '../Components/Footer'
export default function HomePage() {
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
    return (
        <div className="font-poppins">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center mt-20 border-b pb-4">
                    <div className="text-[40px] font-bold">
                        Empowering freelancers and clients to
                        <br />
                        collaborate, create, and grow.
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
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center mt-20 pb-4">
                    <div className="text-[30px] font-bold">
                        Explore endless professional possibilities
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                    {jobCategories.map((category) => (
                        <button
                            key={category.name}
                            className="block w-full p-6 text-left font-bold text-lg border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200">
                            <div className="flex flex-col items-center space-x-3">
                                {category.icon && (
                                    <img
                                        src={category.icon}
                                        alt={`${category.name} icon`}
                                        className="w-8 h-8" // 
                                    />
                                )}
                                <span>{category.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <Footer/>
        </div>
    )
}
