import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../ContextAPI/AuthContext';
import Footer from "../Components/Footer";
import { X, Plus } from 'lucide-react';

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
    
    // State cho phần nhập Skill
    const [skillInput, setSkillInput] = useState('');
    const [skillError, setSkillError] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // ✅ THAY ĐỔI: State chứa danh sách skill từ Database
    const [suggestedSkills, setSuggestedSkills] = useState([]);

    const isVerifiedClient = user && user.role === 'client' && (user.email_verify === 'verified' || user.verify_status === 1 || user.verify_status === true);
    const isModerator = user && user.role === 'admin';

    useEffect(() => {
        if (hasChecked.current) return;
        hasChecked.current = true;

        const checkAccess = async () => {
            if (!user) {
                navigate('/SignInPage');
                return;
            }
            if (isVerifiedClient || isModerator) {
                setIsCheckingAccess(false);
            } else {
                navigate('/AccessDeniedPage');
            }
        };

        checkAccess();
    }, [user, navigate, isVerifiedClient, isModerator]);

    // ✅ THAY ĐỔI: Fetch danh sách Skill từ Database khi component mount
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/skills');
                const data = await res.json();
                if (data.success && Array.isArray(data.skills)) {
                    setSuggestedSkills(data.skills);
                }
            } catch (error) {
                console.error("Failed to fetch suggested skills:", error);
                // Fallback nếu API lỗi thì dùng danh sách rỗng hoặc mặc định
            }
        };
        fetchSkills();
    }, []);

    // Logic gợi ý Skill khi gõ (Sử dụng suggestedSkills từ DB)
    useEffect(() => {
        if (skillInput.trim()) {
            const suggestions = suggestedSkills.filter(skill => 
                skill.toLowerCase().includes(skillInput.toLowerCase()) && 
                !projectData.skills.includes(skill) // Loại bỏ skill đã chọn
            );
            setFilteredSuggestions(suggestions);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, [skillInput, projectData.skills, suggestedSkills]);

    if (isCheckingAccess) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 text-center">
                <div className="text-3xl mb-5 animate-spin">⏳</div>
                <p className="text-gray-600 text-lg">Checking access...</p>
            </div>
        );
    }

    if (!user || (!isVerifiedClient && !isModerator)) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 text-center">
                <h1 className="text-red-500 text-3xl mb-5">Access Denied</h1>
                <p className="text-gray-600 text-lg">Only verified clients or moderators can post projects</p>
                <button onClick={() => navigate('/HomePage')} className="mt-5 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400">
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
        setProjectData(prev => ({ ...prev, [name]: value }));

        if (name === 'title') {
            if (!value.trim()) setErrors(prev => ({ ...prev, title: 'Title is required' }));
            else if (value.trim().length < 5) setErrors(prev => ({ ...prev, title: 'Title must be at least 5 characters long' }));
            else if (value.trim().length > 250) setErrors(prev => ({ ...prev, title: 'Title cannot exceed 250 characters' }));
            else setErrors(prev => ({ ...prev, title: '' }));
        }
        if (name === 'description') {
            if (!value.trim()) setErrors(prev => ({ ...prev, description: 'Description is required' }));
            else if (value.trim().length < 20) setErrors(prev => ({ ...prev, description: 'Description must be at least 20 characters long' }));
            else if (value.trim().length > 2500) setErrors(prev => ({ ...prev, description: 'Description cannot exceed 2500 characters' }));
            else setErrors(prev => ({ ...prev, description: '' }));
        }
        if (name === 'budget') {
            const num = Number(value);
            if (!value || isNaN(num)) setErrors(prev => ({ ...prev, budget: 'Budget must be greater than 0' }));
            else if (num < 1000000) setErrors(prev => ({ ...prev, budget: 'Budget must be at least 1,000,000 VND' }));
            else if (num > 100000000000) setErrors(prev => ({ ...prev, budget: 'Budget cannot exceed 100 billion VND' }));
            else setErrors(prev => ({ ...prev, budget: '' }));
        }

        if (errors[name] && !['title', 'description', 'budget'].includes(name)) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddSkill = (skill) => {
        const trimmedSkill = skill.trim();
        if (trimmedSkill.length > 250) {
            setSkillError('Each skill cannot exceed 250 characters.');
            setSkillInput('');
            return;
        }
        setSkillError('');
        // Check duplicates case-insensitive
        if (trimmedSkill && !projectData.skills.some(s => s.toLowerCase() === trimmedSkill.toLowerCase())) {
            setProjectData(prev => ({ ...prev, skills: [...prev.skills, trimmedSkill] }));
        }
        setSkillInput('');
        setShowSuggestions(false);
    };

    const handleSkillInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill(skillInput);
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setProjectData(prev => ({ ...prev, skills: prev.skills.filter(skill => skill !== skillToRemove) }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!projectData.title.trim()) newErrors.title = 'Title is required';
        else if (projectData.title.trim().length < 5) newErrors.title = 'Title must be at least 5 characters long';
        else if (projectData.title.trim().length > 250) newErrors.title = 'Title cannot exceed 250 characters';

        if (!projectData.description.trim()) newErrors.description = 'Description is required';
        else if (projectData.description.trim().length < 20) newErrors.description = 'Description must be at least 20 characters long';
        else if (projectData.description.trim().length > 2500) newErrors.description = 'Description cannot exceed 2500 characters';

        if (!projectData.budget || projectData.budget <= 0) newErrors.budget = 'Budget must be greater than 0';
        else if (projectData.budget > 100000000000) newErrors.budget = 'Budget cannot exceed 100 billion VND';

        if (!projectData.category) newErrors.category = 'Category is required';
        if (!projectData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
        if (!projectData.workForm) newErrors.workForm = 'Work form is required';
        
        if (projectData.skills.length === 0) newErrors.skills = 'At least one skill is required';

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
            alert('Backend server is not running!');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:3000/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: projectData.title,
                    description: projectData.description,
                    budget: projectData.budget,
                    category: projectData.category,
                    skills: projectData.skills,
                    paymentMethod: projectData.paymentMethod,
                    workForm: projectData.workForm,
                    clientEmail: user.email 
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('Project posted successfully!\n\nIt is pending admin approval. Bidding deadline will be set 7 days from approval.');
                setProjectData({
                    title: '', description: '', budget: '', paymentMethod: '', workForm: '', category: '', skills: []
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
        { value: 'Hourly', label: 'Hourly Rate' },
        { value: 'Fixed', label: 'Fixed Price (Per Project)' },
        { value: 'Milestone', label: 'By Milestone' }
    ];

    const workForms = [
        { value: 'Remote', label: 'Remote (Online)' },
        { value: 'Onsite', label: 'Onsite (Offline)' },
        { value: 'Hybrid', label: 'Hybrid (Both)' }
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
                        <input type="text" id="title" name="title" value={projectData.title} onChange={handleChange} placeholder="Enter project title" className={`mt-2 ${inputStyle} ${errors.title ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.title && <span className={errorStyle}>{errors.title}</span>}
                    </div>

                    <div>
                        <label htmlFor="description" className={labelStyle}>Project Description</label>
                        <textarea id="description" name="description" value={projectData.description} onChange={handleChange} placeholder="Enter project details..." rows="5" className={`mt-2 ${inputStyle} ${errors.description ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.description && <span className={errorStyle}>{errors.description}</span>}
                        <small className={helperStyle}>At least 20 characters</small>
                    </div>

                    <div>
                        <label htmlFor="budget" className={labelStyle}>Budget (VND)</label>
                        <input type="number" id="budget" name="budget" value={projectData.budget} onChange={handleChange} placeholder="Enter budget" min="1000000" className={`mt-2 ${inputStyle} ${errors.budget ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.budget && <span className={errorStyle}>{errors.budget}</span>}
                        <small className={helperStyle}>Minimum 1 million VND</small>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label htmlFor="paymentMethod" className={labelStyle}>Payment Method</label>
                            <select id="paymentMethod" name="paymentMethod" value={projectData.paymentMethod} onChange={handleChange} className={`mt-2 ${inputStyle} ${errors.paymentMethod ? 'border-red-500' : 'border-gray-300'}`}>
                                <option value="" disabled>Select payment method</option>
                                {paymentMethods.map(method => (<option key={method.value} value={method.value}>{method.label}</option>))}
                            </select>
                            {errors.paymentMethod && <span className={errorStyle}>{errors.paymentMethod}</span>}
                        </div>

                        <div>
                            <label htmlFor="workForm" className={labelStyle}>Work Form</label>
                            <select id="workForm" name="workForm" value={projectData.workForm} onChange={handleChange} className={`mt-2 ${inputStyle} ${errors.workForm ? 'border-red-500' : 'border-gray-300'}`}>
                                <option value="" disabled>Select work form</option>
                                {workForms.map(format => (<option key={format.value} value={format.value}>{format.label}</option>))}
                            </select>
                            {errors.workForm && <span className={errorStyle}>{errors.workForm}</span>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="category" className={labelStyle}>Category</label>
                        <select id="category" name="category" value={projectData.category} onChange={handleChange} className={`mt-2 ${inputStyle} ${errors.category ? 'border-red-500' : 'border-gray-300'}`}>
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

                    {/* PHẦN SKILL ĐÃ ĐƯỢC CẬP NHẬT */}
                    <div className="relative">
                        <label htmlFor="skills" className={labelStyle}>Required Skills</label>
                        <div className="flex gap-3 mt-2">
                            <div className="relative w-full">
                                <input 
                                    type="text" id="skills" 
                                    value={skillInput} 
                                    onChange={(e) => setSkillInput(e.target.value)} 
                                    onKeyDown={handleSkillInputKeyDown} 
                                    placeholder="Type to search or add custom skill..." 
                                    className={`${inputStyle} placeholder:text-gray-400`} 
                                    autoComplete="off"
                                />
                                {/* Dropdown gợi ý */}
                                {showSuggestions && filteredSuggestions.length > 0 && (
                                    <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                                        {filteredSuggestions.map((skill, index) => (
                                            <div 
                                                key={index}
                                                onClick={() => handleAddSkill(skill)}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                            >
                                                {skill}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button type="button" onClick={() => handleAddSkill(skillInput)} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </div>
                        
                        {skillError && <span className={errorStyle}>{skillError}</span>}
                        {errors.skills && <span className={errorStyle}>{errors.skills}</span>}
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                            {projectData.skills.map((skill, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-gray-800 text-sm font-medium border border-gray-200">
                                    <span>{skill}</span>
                                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-gray-500 hover:text-red-500 transition-colors" title={`Remove ${skill}`}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-10">
                        <button type="button" onClick={() => navigate('/HomePage')} className="px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" disabled={isSubmitting}>Cancel</button>
                        <button type="submit" disabled={isSubmitting} className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}>
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