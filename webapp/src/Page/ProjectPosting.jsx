import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../ContextAPI/AuthContext';
import Footer from "../Components/Footer";

const ProjectPosting = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const hasChecked = useRef(false);
    const [isCheckingAccess, setIsCheckingAccess] = useState(true);

    const [projectData, setProjectData] = useState({
        title: '',
        description: '',
        budget: '',
        paymentMethod: '',
        workForm: '',
        category: '',
        skills: []
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        if (hasChecked.current) return;
        hasChecked.current = true;

        const checkAccess = async () => {
            if (!user) {
                navigate('/SignInPage');
                return;
            }
            if (
                (user.role === 'client' && user.email_verify === 'verified') ||
                user.role === 'moderator'
            ) {
                setIsCheckingAccess(false);
            } else {
                navigate('/AccessDeniedPage');
            }
        };

        checkAccess();
    }, [user, navigate]);

    if (isCheckingAccess) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 text-center">
                <div className="text-3xl mb-5">⏳</div>
                <p className="text-gray-600 text-lg">Checking access...</p>
            </div>
        );
    }

    if (
        !user ||
        !(
            (user.role === 'client' && user.email_verify === 'verified') ||
            user.role === 'moderator'
        )
    ) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 text-center">
                <h1 className="text-red-500 text-3xl mb-5">Access Denied</h1>
                <p className="text-gray-600 text-lg">
                    Only verified clients or moderators can post projects
                </p>
                <button
                    onClick={() => navigate('/HomePage')}
                    className="mt-5 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400"
                >
                    Go back to homepage
                </button>
            </div>
        );
    }

    const checkBackendConnection = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/projects');
            const data = await response.json();
            return data.success === true;
        } catch (error) {
            console.log('Backend connection error:', error);
            return false;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProjectData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleAddSkill = (skill) => {
        const trimmedSkill = skill.trim();
        if (trimmedSkill && !projectData.skills.includes(trimmedSkill)) {
            setProjectData(prev => ({
                ...prev,
                skills: [...prev.skills, trimmedSkill]
            }));
        }
        setSkillInput('');
    };

    const handleSkillInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddSkill(skillInput);
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setProjectData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!projectData.title.trim()) newErrors.title = 'Title is required';
        else if (projectData.title.trim().length < 5) newErrors.title = 'Title must be at least 5 characters long';

        if (!projectData.description.trim()) newErrors.description = 'Description is required';
        else if (projectData.description.trim().length < 20) newErrors.description = 'Description must be at least 20 characters long';

        if (!projectData.budget || projectData.budget <= 0) newErrors.budget = 'Budget must be greater than 0';
        else if (projectData.budget > 100000000000) newErrors.budget = 'Budget cannot exceed 100 billion VND';

        if (!projectData.category) newErrors.category = 'Category is required';

        if (!projectData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';

        if (!projectData.workForm) newErrors.workForm = 'Work form is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            alert('Please check the entered information!');
            return;
        }

        const isBackendRunning = await checkBackendConnection();
        if (!isBackendRunning) {
            alert('Backend server is not running!\n\nRun the following commands in the terminal:\ncd server\nnpm install\nnpm run dev');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:3000/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...projectData,
                    clientId: user.id || 'user123',
                    clientName: user.name || 'Client',
                    clientEmail: user.email || 'client@example.com',
                    status: 'pending',
                    createdAt: new Date().toISOString()
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('Project posted successfully!\n\nIt is pending admin approval.');
                setProjectData({
                    title: '',
                    description: '',
                    budget: '',
                    paymentMethod: '',
                    workForm: '',
                    category: '',
                    skills: []
                });
                setSkillInput('');
                navigate('/HomePage');
            } else {
                alert(`Server error: ${result.message || 'Unable to post project'}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('An error occurred while posting the project: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    const paymentMethods = [
        { value: 'per_hour', label: 'Per hour' },
        { value: 'per_day', label: 'Per day' },
        { value: 'per_month', label: 'Per month' },
        { value: 'per_project', label: 'Per project' },
    ];
    const workForms = [
        { value: 'Online', label: 'Online' },
        { value: 'Offline', label: 'Offline' },
        { value: 'Both', label: 'Both' },
        { value: 'Other', label: 'Other' }
    ];
    const labelStyle = "block text-base font-semibold text-gray-800";
    const inputStyle = "p-3 border border-gray-300 rounded-lg w-full text-base focus:ring-2 focus:ring-black focus:border-black transition";
    const errorStyle = "text-red-500 text-sm mt-1";
    const helperStyle = "text-gray-500 italic text-sm mt-1 block";
    return (
        <div className="font-poppins min-h-screen text-gray-900">
            <div className="mx-auto bg-white p-10 sm:p-12 rounded-lg shadow-lg">
                <div className="text-left mb-10 pb-6 border-gray-200">
                    <h1 className="text-4xl font-bold text-black mb-2 font-lora">Post Project</h1>
                    <p className="text-gray-600 text-lg">Please fill out the form below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label htmlFor="title" className={labelStyle}>Project Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={projectData.title}
                            onChange={handleChange}
                            placeholder="Enter project title"
                            className={`mt-2 ${inputStyle} ${errors.paymentMethod ? 'border-red-500' : 'border-gray-300'} ${projectData.paymentMethod === '' ? 'text-gray-500' : 'text-gray-900'}`}
                        />
                        {errors.title && <span className={errorStyle}>{errors.title}</span>}
                    </div>
                    <div>
                        <label htmlFor="description" className={labelStyle}>Project Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={projectData.description}
                            onChange={handleChange}
                            placeholder="Enter project details, goals, and specific requirements..."
                            rows="5"
                            className={`mt-2 ${inputStyle} ${errors.workForm ? 'border-red-500' : 'border-gray-300'} ${projectData.workForm === '' ? 'text-gray-500' : 'text-gray-900'}`}
                        />
                        {errors.description && <span className={errorStyle}>{errors.description}</span>}
                        <small className={helperStyle}>At least 20 characters</small>
                    </div>
                    <div>
                        <label htmlFor="budget" className={labelStyle}>Budget (VND)</label>
                        <input
                            type="number"
                            id="budget"
                            name="budget"
                            value={projectData.budget}
                            onChange={handleChange}
                            placeholder="Enter budget"
                            min="1000000"
                            max="1000000000"
                            className={`mt-2 ${inputStyle} ${errors.category ? 'border-red-500' : 'border-gray-300'} ${projectData.category === '' ? 'text-gray-500' : 'text-gray-900'}`}
                        />
                        {errors.budget && <span className={errorStyle}>{errors.budget}</span>}
                        <small className={helperStyle}>Minimum 1 million VND</small>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label htmlFor="paymentMethod" className={labelStyle}>Payment Method</label>
                            <select
                                id="paymentMethod"
                                name="paymentMethod"
                                value={projectData.paymentMethod}
                                onChange={handleChange}
                                className={`mt-2 ${inputStyle} ${errors.paymentMethod ? 'border-red-500' : 'border-gray-300'} ${projectData.paymentMethod === '' ? 'text-gray-500' : 'text-gray-900'}`}
                            >
                                <option value="" disabled>Select payment method</option>
                                {paymentMethods.map(method => (
                                    <option key={method.value} value={method.value}>
                                        {method.label}
                                    </option>
                                ))}
                            </select>
                            {errors.paymentMethod && <span className={errorStyle}>{errors.paymentMethod}</span>}
                        </div>

                        <div>
                            <label htmlFor="workForm" className={labelStyle}>Work Form</label>
                            <select
                                id="workForm"
                                name="workForm"
                                value={projectData.workForm}
                                onChange={handleChange}
                                className={`mt-2 ${inputStyle} ${errors.workForm ? 'border-red-500' : 'border-gray-300'} ${projectData.paymentMethod === '' ? 'text-gray-500' : 'text-gray-900'}`}
                            >
                                <option value="" disabled>Select work form</option>
                                {workForms.map(format => (
                                    <option key={format.value} value={format.value}>
                                        {format.label}
                                    </option>
                                ))}
                            </select>
                            {errors.workForm && <span className={errorStyle}>{errors.workForm}</span>}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="category" className={labelStyle}>Category</label>
                        <select
                            id="category"
                            name="category"
                            value={projectData.category}
                            onChange={handleChange}
                            className={`mt-2 ${inputStyle} ${errors.category ? 'border-red-500' : 'border-gray-300'} ${projectData.paymentMethod === '' ? 'text-gray-500' : 'text-gray-900'}`}
                        >
                            <option value="" disabled>Select category</option>
                            <option value="web development">Web development</option>
                            <option value="mobile development">Mobile development</option>
                            <option value="embedded engineer">Embedded Engineering</option>
                            <option value="ui/ux design">UI/UX design</option>
                            <option value="quality asssurance">Quality Assurance</option>
                            <option value="project management">Project Management</option>
                            <option value="devops">DevOps Engineering</option>
                            <option value="digital security">Digital Security</option>
                        </select>
                        {errors.category && <span className={errorStyle}>{errors.category}</span>}
                    </div>
                    <div>
                        <label htmlFor="skills" className={labelStyle}>Required Skills</label>
                        <div className="flex gap-3 mt-2">
                            <input
                                type="text"
                                id="skills"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={handleSkillInputKeyDown}
                                placeholder="Enter skill and press Add"
                                className={`${inputStyle} placeholder:text-gray-400`}
                            />
                            <button
                                type="button"
                                onClick={() => handleAddSkill(skillInput)}
                                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-4">
                            {projectData.skills.map((skill, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-gray-700 font-medium">
                                    <span>{skill}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSkill(skill)}
                                        className="text-gray-500 hover:text-red-500 font-bold text-lg"
                                        title={`Remove ${skill}`}
                                    >
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-10">
                        <button
                            type="button"
                            onClick={() => navigate('/HomePage')}
                            className="px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
                                }`}
                        >
                            {isSubmitting ? 'Processing...' : 'Post Project'}
                        </button>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default ProjectPosting;
