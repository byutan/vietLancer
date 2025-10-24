import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from "../Components/Footer";
import ProfileIcon from '../Public/profile_icon.svg';
import AddIcon from '../Public/addIcon.svg';
import RemoveIcon from '../Public/remove_icon.svg';
import ChevronDownIcon from '../Public/chevron_down.svg';
import AuthContext from '../ContextAPI/AuthContext';

export default function ProfilePage() {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [fileName, setFileName] = useState("No file chosen");
    const [isVerified, setIsVerified] = useState(false); 
    const [personalInfo, setPersonalInfo] = useState({
        fullname: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        dob: '',
    });
    const [languages, setLanguages] = useState([]);
    const [education, setEducation] = useState([]);
    const [experience, setExperience] = useState([]);
    const [showAddLanguage, setShowAddLanguage] = useState(false);
    const [showAddEducation, setShowAddEducation] = useState(false);
    const [showAddExperience, setShowAddExperience] = useState(false);
    const [newLanguage, setNewLanguage] = useState({ name: '', level: 'Beginner' });
    const [newEducation, setNewEducation] = useState({ school: '', degree: '', major: '', startYear: '', endYear: '' });
    const [newExperience, setNewExperience] = useState({ company: '', title: '', description: '', startYear: '', endYear: '' });
    const [openExperienceIndex, setOpenExperienceIndex] = useState(null);
    const [educationErrors, setEducationErrors] = useState({});
    const [experienceErrors, setExperienceErrors] = useState({});
    useEffect(() => {
        if (!user) {
            navigate('/SignInPage');
        } else {
            setIsVerified(true);
        }
    }, [user, navigate]);

    useEffect(() => {
        if (user) {
            setPersonalInfo(prevInfo => ({
                ...prevInfo,
                fullname: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                dob: user.dob ? user.dob.split('T')[0] : '',
            }));
            if (user.avatarUrl && !avatarPreview) {
                setAvatarPreview(user.avatarUrl);
            } else if (!user.avatarUrl && !avatarPreview) {
                setAvatarPreview(null);
            }
            setLanguages(user.skills?.languages || []);
            setEducation(user.skills?.education || []);
            setExperience(user.skills?.experience || []);
        }
    }, [user, avatarPreview]);
     if (!isVerified) {
        return null; 
    }
    const handlePersonalInfoChange = (event) => {
        const { name, value } = event.target;
        setPersonalInfo(prevInfo => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert("File size exceeds 10 MB limit.");
                event.target.value = null;
                return;
            }
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                alert("Only JPEG, JPG, or PNG files are allowed.");
                event.target.value = null;
                return;
            }
            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setAvatarPreview(user?.avatarUrl || null);
            setFileName("No chosen file.");
        }
    };
    const handleNewLanguageChange = (e) => {
        const { name, value } = e.target;
        setNewLanguage(prev => ({ ...prev, [name]: value }));
    };
    const handleSaveNewLanguage = () => {
        if (!newLanguage.name.trim()) return alert("Please enter a language name.");
        const duplicate = languages.find(lang => lang.name.toLowerCase() === newLanguage.name.trim().toLowerCase());
        if (duplicate) return alert(`Language "${newLanguage.name}" already exists.`);
        setLanguages([...languages, { ...newLanguage, name: newLanguage.name.trim() }]);
        setNewLanguage({ name: '', level: 'Beginner' });
        setShowAddLanguage(false);
    };
    const removeLanguage = (index) => setLanguages(languages.filter((_, i) => i !== index));

    const handleNewEducationChange = (e) => {
        const { name, value } = e.target;
        setNewEducation(prev => ({ ...prev, [name]: value }));
    };
    const handleSaveNewEducation = () => {
        const currentYear = new Date().getFullYear();
        const { school, degree, major, startYear, endYear } = newEducation;
        const errors = {};

        if (!school.trim()) errors.school = "School name is required.";
        if (!startYear) errors.startYear = "Start year is required.";
        if (!endYear) errors.endYear = "End year is required.";

        if (startYear && endYear && Number(startYear) > Number(endYear))
            errors.endYear = "End year cannot be earlier than start year.";

        if ((startYear && Number(startYear) > currentYear) || (endYear && Number(endYear) > currentYear))
            errors.startYear = "Years cannot be in the future.";

        if (Object.keys(errors).length > 0) {
            setEducationErrors(errors);
            return;
        }

        setEducationErrors({});
        setEducation([...education, { school: school.trim(), degree, major, startYear, endYear }]);
        setNewEducation({ school: '', degree: '', major: '', startYear: '', endYear: '' });
        setShowAddEducation(false);
    };
    const removeEducation = (index) => setEducation(education.filter((_, i) => i !== index));

    const handleNewExperienceChange = (e) => {
        const { name, value } = e.target;
        setNewExperience(prev => ({ ...prev, [name]: value }));
    };
    const handleSaveNewExperience = () => {
        const currentYear = new Date().getFullYear();
        const { company, title, description, startYear, endYear } = newExperience;
        const errors = {};

        if (!company.trim()) errors.company = "Company name is required.";
        if (!title.trim()) errors.title = "Job title is required.";
        if (!startYear) errors.startYear = "Start year is required.";
        if (!endYear) errors.endYear = "End year is required.";

        if (startYear && endYear && Number(startYear) > Number(endYear))
            errors.endYear = "End year cannot be earlier than start year.";

        if ((startYear && Number(startYear) > currentYear) || (endYear && Number(endYear) > currentYear))
            errors.startYear = "Years cannot be in the future.";

        if (Object.keys(errors).length > 0) {
            setExperienceErrors(errors);
            return;
        }

        setExperienceErrors({});
        setExperience([...experience, { company: company.trim(), title: title.trim(), description, startYear, endYear }]);
        setNewExperience({ company: '', title: '', description: '', startYear: '', endYear: '' });
        setShowAddExperience(false);
    };
    const removeExperience = (index) => setExperience(experience.filter((_, i) => i !== index));
    const handleSaveAll = async () => {
        let personalInfoToSend = { ...personalInfo };
        if (!personalInfo.password) {
            delete personalInfoToSend.password;
        }
        const avatarDataToSend = avatarPreview && avatarPreview.startsWith('data:') ? avatarPreview : undefined;


        const allData = {
            personalInfo: { ...personalInfoToSend, avatar: avatarDataToSend },
            skills: { languages, education, experience }
        };
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/profile/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(allData)
            });

            const result = await res.json();
            if (res.ok) {
                setUser(result.user);
                if (result.token) {
                    localStorage.setItem('token', result.token);
                }
                alert("Profile updated successfully!");
            } else {
                alert(`Failed to update profile: ${result.message || result.error || 'Unknown server error'}`);
            }
        } catch {
            alert('An error occurred while connecting to the server.');
        }
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        handleSaveAll();
    };
    const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
    const inputStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm";
    const sectionTitleStyle = "text-xl font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6"; // Kích thước title nhỏ hơn chút
    const buttonBaseStyle = "inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
    const primaryButtonStyle = `${buttonBaseStyle} border-transparent bg-black text-white hover:bg-gray-800 focus:ring-black`;
    const secondaryButtonStyle = `${buttonBaseStyle} border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-black`;
    const tertiaryButtonStyle = `${buttonBaseStyle} border-2 border-dashed border-gray-300 text-gray-600 hover:text-black hover:border-black hover:bg-gray-50 focus:ring-black w-full`;
    const removeButtonStyle = "text-gray-400 hover:text-red-500 transition-colors";
    return (
        <div className="font-poppins flex flex-col min-h-screen bg-gray-50 text-gray-900">
            <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8">
                <form className="w-full max-w-7xl mx-auto space-y-10" onSubmit={handleFormSubmit}>

                    {/* --- PERSONAL INFORMATION (No changes) --- */}
                    <section className="bg-white p-6 sm:p-8 rounded-lg shadow">
                        <h2 className={sectionTitleStyle}>Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                            <div className="md:col-span-1 space-y-4">
                                <label className={labelStyle}>Avatar</label>
                                <div className="flex flex-col items-center space-y-3">
                                    <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden ring-1 ring-gray-300">
                                        <img src={avatarPreview || ProfileIcon} alt="Avatar" className={`object-cover text-gray-400 ${avatarPreview ? 'w-full h-full' : 'w-20 h-20'}`} />
                                    </div>
                                    <input id="avatar-upload" name="avatar-upload" type="file" className="hidden" accept="image/jpeg, image/jpg, image/png" onChange={handleAvatarChange} />
                                    <label htmlFor="avatar-upload" className={`${secondaryButtonStyle} cursor-pointer text-xs px-3 py-1.5 w-full text-center sm:w-auto`}>Choose File</label>
                                    <span className="text-xs text-gray-500 text-center truncate w-full px-2" title={fileName}>{fileName}</span>
                                    <p className="text-xs text-gray-500 text-center">Max 10MB (JPG, PNG)</p>
                                </div>
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                <div className="sm:col-span-2">
                                    <label htmlFor="fullname" className={labelStyle}>Full Name</label>
                                    <input id="fullname" name="fullname" type="text" autoComplete="name" required className={inputStyle} value={personalInfo.fullname} onChange={handlePersonalInfoChange} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="email" className={labelStyle}>Email Address</label>
                                    <input id="email" name="email" type="email" autoComplete="email" required className={inputStyle} value={personalInfo.email} onChange={handlePersonalInfoChange} />
                                </div>
                                <div>
                                    <label htmlFor="dob" className={labelStyle}>Date of Birth</label>
                                    <input id="dob" name="dob" type="date" className={`${inputStyle} text-gray-700`} value={personalInfo.dob} onChange={handlePersonalInfoChange} />
                                </div>
                                <div>
                                    <label htmlFor="phone" className={labelStyle}>Phone Number</label>
                                    <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputStyle} value={personalInfo.phone} onChange={handlePersonalInfoChange} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="address" className={labelStyle}>Address</label>
                                    <input id="address" name="address" type="text" autoComplete="street-address" className={inputStyle} value={personalInfo.address} onChange={handlePersonalInfoChange} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="password" className={labelStyle}>New Password (Optional)</label>
                                    <div className="relative">
                                        <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" className={inputStyle} placeholder="Leave blank to keep current" value={personalInfo.password} onChange={handlePersonalInfoChange} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 hover:text-gray-700" aria-label={showPassword ? "Hide password" : "Show password"}>
                                            {showPassword ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Only fill this if you want to change your password.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-6 sm:p-8 rounded-lg shadow space-y-8">
                        <h2 className={sectionTitleStyle}>Skills & Experience</h2>

                        {/* --- FOREIGN LANGUAGES (No changes) --- */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900">Foreign Languages</h3>
                            <div className="space-y-3">
                                {languages.length > 0 ? languages.map((language, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                                        <div>
                                            <span className="font-medium">{language.name}</span>
                                            <span className="text-gray-600 text-sm"> - {language.level}</span>
                                        </div>
                                        <button type="button" onClick={() => removeLanguage(index)} className={`${removeButtonStyle} p-1`} aria-label={`Remove ${language.name}`}>
                                            <img src={RemoveIcon} alt="Remove" className="w-4 h-4" />
                                        </button>
                                    </div>
                                )) : <p className="text-sm text-gray-500 italic">No languages added yet.</p>}
                            </div>
                            {showAddLanguage ? (
                                <div className="p-4 border rounded-md bg-gray-50 space-y-3 mt-4">
                                    <div>
                                        <label htmlFor="lang-name" className={labelStyle}>Language Name</label>
                                        <input type="text" name="name" id="lang-name" className={inputStyle} value={newLanguage.name} onChange={handleNewLanguageChange} placeholder="E.g., English" />
                                    </div>
                                    <div>
                                        <label htmlFor="lang-level" className={labelStyle}>Level</label>
                                        <select name="level" id="lang-level" className={inputStyle} value={newLanguage.level} onChange={handleNewLanguageChange}>
                                            <option>Beginner</option> <option>Intermediate</option> <option>Expert</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end space-x-2 pt-2">
                                        <button type="button" onClick={() => setShowAddLanguage(false)} className={secondaryButtonStyle}>Cancel</button>
                                        <button type="button" onClick={handleSaveNewLanguage} className={primaryButtonStyle}>Save Language</button>
                                    </div>
                                </div>
                            ) : (
                                <button type="button" onClick={() => setShowAddLanguage(true)} className={tertiaryButtonStyle}>
                                    <img src={AddIcon} alt="" className="w-4 h-4 mr-2" /> Add Language
                                </button>
                            )}
                        </div>

                        {/* --- EDUCATION (Error messages added) --- */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900">Education</h3>
                            <div className="space-y-3">
                                {education.length > 0 ? education.map((edu, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                                        <div>
                                            <span className="font-medium">{edu.school}</span>
                                            <span className="block text-gray-600 text-sm">
                                                {edu.degree} in {edu.major || 'N/A'} ({edu.startYear} - {edu.endYear || 'Present'})
                                            </span>
                                        </div>
                                        <button type="button" onClick={() => removeEducation(index)} className={`${removeButtonStyle} p-1`} aria-label={`Remove ${edu.school}`}>
                                            <img src={RemoveIcon} alt="Remove" className="w-4 h-4" />
                                        </button>
                                    </div>
                                )) : <p className="text-sm text-gray-500 italic">No education history added yet.</p>}
                            </div>
                            {showAddEducation ? (
                                <div className="p-4 border rounded-md bg-gray-50 space-y-3 mt-4">
                                    <div>
                                        <label htmlFor="edu-school" className={labelStyle}>School / University</label>
                                        <input
                                            type="text"
                                            name="school"
                                            id="edu-school"
                                            className={`${inputStyle} ${educationErrors.school ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                            placeholder="E.g., Harvard University"
                                            value={newEducation.school}
                                            onChange={handleNewEducationChange}
                                        />
                                        {educationErrors.school && <p className="mt-1 text-xs text-red-600">{educationErrors.school}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="edu-major" className={labelStyle}>Major</label>
                                        <input
                                            type="text"
                                            name="major"
                                            id="edu-major"
                                            className={inputStyle} // Thêm validation lỗi nếu cần
                                            placeholder="E.g., Computer Science"
                                            value={newEducation.major}
                                            onChange={handleNewEducationChange}
                                        />
                                        {/* {educationErrors.major && <p className="mt-1 text-xs text-red-600">{educationErrors.major}</p>} */}
                                    </div>
                                    <div>
                                        <label htmlFor="edu-degree" className={labelStyle}>Degree</label>
                                        <select
                                            name="degree"
                                            id="edu-degree"
                                            className={inputStyle} // Thêm validation lỗi nếu cần
                                            value={newEducation.degree}
                                            onChange={handleNewEducationChange}
                                        >
                                            <option value="">Select Degree</option>
                                            <option>Bachelor</option>
                                            <option>Master</option>
                                            <option>Ph.D</option>
                                            <option>Other</option>
                                        </select>
                                        {/* {educationErrors.degree && <p className="mt-1 text-xs text-red-600">{educationErrors.degree}</p>} */}
                                    </div>
                                    <div className="flex space-x-4">
                                        <div className="w-1/2">
                                            <label htmlFor="edu-start" className={labelStyle}>Start Year</label>
                                            <input
                                                type="number"
                                                name="startYear"
                                                id="edu-start"
                                                className={`${inputStyle} ${educationErrors.startYear ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                                placeholder="YYYY"
                                                value={newEducation.startYear}
                                                onChange={handleNewEducationChange}
                                                min="1900"
                                                max={new Date().getFullYear() + 5}
                                            />
                                            {educationErrors.startYear && <p className="mt-1 text-xs text-red-600">{educationErrors.startYear}</p>}
                                        </div>
                                        <div className="w-1/2">
                                            <label htmlFor="edu-end" className={labelStyle}>End Year</label>
                                            <input
                                                type="number"
                                                name="endYear"
                                                id="edu-end"
                                                className={`${inputStyle} ${educationErrors.endYear ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                                placeholder="YYYY or Present"
                                                value={newEducation.endYear}
                                                onChange={handleNewEducationChange}
                                                min="1900"
                                                max={new Date().getFullYear() + 10}
                                            />
                                            {educationErrors.endYear && <p className="mt-1 text-xs text-red-600">{educationErrors.endYear}</p>}
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddEducation(false);
                                                setEducationErrors({}); // Xóa lỗi khi cancel
                                            }}
                                            className={secondaryButtonStyle}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSaveNewEducation}
                                            className={primaryButtonStyle}
                                        >
                                            Save Education
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowAddEducation(true)}
                                    className={tertiaryButtonStyle}
                                >
                                    <img src={AddIcon} alt="" className="w-4 h-4 mr-2" /> Add Education
                                </button>
                            )}
                        </div>

                        {/* --- WORK EXPERIENCE (Error messages added) --- */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
                            <div className="space-y-3">
                                {experience.length > 0 ? experience.map((exp, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 rounded-md bg-white overflow-hidden shadow-sm"
                                    >
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-t-md cursor-pointer"
                                            onClick={() =>
                                                setOpenExperienceIndex(
                                                    openExperienceIndex === index ? null : index
                                                )
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    setOpenExperienceIndex(
                                                        openExperienceIndex === index ? null : index
                                                    );
                                                }
                                            }}
                                            aria-expanded={openExperienceIndex === index}
                                            aria-controls={`experience-details-${index}`}
                                        >
                                            <div>
                                                <span className="font-medium">{exp.title}</span>
                                                <span className="text-gray-600 text-sm"> at {exp.company}</span>
                                                <span className="block text-gray-500 text-xs">
                                                    ({exp.startYear} - {exp.endYear || "Present"})
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeExperience(index);
                                                    }}
                                                    className={`${removeButtonStyle} p-1 rounded-full hover:bg-red-50`}
                                                    aria-label={`Remove ${exp.title} at ${exp.company}`}
                                                >
                                                    <img src={RemoveIcon} alt="Remove" className="w-4 h-4" />
                                                </button>
                                                <img
                                                    src={ChevronDownIcon}
                                                    alt=""
                                                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openExperienceIndex === index ? "rotate-180" : ""
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                        <div
                                            id={`experience-details-${index}`}
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${openExperienceIndex === index ? "max-h-96" : "max-h-0"
                                                }`}
                                        >
                                            <div className="px-4 pb-4 pt-2 border-t border-gray-200 bg-gray-50">
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                    {exp.description || (
                                                        <span className="italic text-gray-500">
                                                            No description provided.
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-500 italic">
                                        No work experience added yet.
                                    </p>
                                )}
                            </div>
                            {showAddExperience ? (
                                <div className="p-4 border rounded-md bg-gray-50 space-y-3 mt-4">
                                    <div>
                                        <label htmlFor="exp-company" className={labelStyle}>Company Name</label>
                                        <input
                                            type="text"
                                            name="company"
                                            id="exp-company"
                                            className={`${inputStyle} ${experienceErrors.company ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                            value={newExperience.company}
                                            onChange={handleNewExperienceChange}
                                            placeholder="E.g., Google"
                                        />
                                        {experienceErrors.company && <p className="mt-1 text-xs text-red-600">{experienceErrors.company}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="exp-title" className={labelStyle}>Job Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            id="exp-title"
                                            className={`${inputStyle} ${experienceErrors.title ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                            value={newExperience.title}
                                            onChange={handleNewExperienceChange}
                                            placeholder="E.g., Senior Software Engineer"
                                        />
                                        {experienceErrors.title && <p className="mt-1 text-xs text-red-600">{experienceErrors.title}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="exp-desc" className={labelStyle}>Description</label>
                                        <textarea name="description" id="exp-desc" rows="3" className={inputStyle} value={newExperience.description} onChange={handleNewExperienceChange} placeholder="Describe your responsibilities..." />
                                    </div>
                                    <div className="flex space-x-4">
                                        <div className="w-1/2">
                                            <label htmlFor="exp-start" className={labelStyle}>Start Year</label>
                                            <input
                                                type="number"
                                                name="startYear"
                                                id="exp-start"
                                                className={`${inputStyle} ${experienceErrors.startYear ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                                placeholder="YYYY"
                                                value={newExperience.startYear}
                                                onChange={handleNewExperienceChange}
                                                min="1900"
                                                max={new Date().getFullYear() + 5}
                                            />
                                            {experienceErrors.startYear && <p className="mt-1 text-xs text-red-600">{experienceErrors.startYear}</p>}
                                        </div>
                                        <div className="w-1/2">
                                            <label htmlFor="exp-end" className={labelStyle}>End Year</label>
                                            <input
                                                type="number"
                                                name="endYear"
                                                id="exp-end"
                                                className={`${inputStyle} ${experienceErrors.endYear ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                                placeholder="YYYY or Present"
                                                value={newExperience.endYear}
                                                onChange={handleNewExperienceChange}
                                                min="1900"
                                                max={new Date().getFullYear() + 10}
                                            />
                                            {experienceErrors.endYear && <p className="mt-1 text-xs text-red-600">{experienceErrors.endYear}</p>}
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddExperience(false);
                                                setExperienceErrors({}); // Xóa lỗi khi cancel
                                            }}
                                            className={secondaryButtonStyle}
                                        >
                                            Cancel
                                        </button>
                                        <button type="button" onClick={handleSaveNewExperience} className={primaryButtonStyle}>Save Experience</button>
                                    </div>
                                </div>
                            ) : (
                                <button type="button" onClick={() => setShowAddExperience(true)} className={tertiaryButtonStyle}>
                                    <img src={AddIcon} alt="" className="w-4 h-4 mr-2" /> Add Experience
                                </button>
                            )}
                        </div>
                    </section>

                    <div className="flex justify-end pt-2">
                        <button type="submit" className={`${primaryButtonStyle} py-2.5 px-6 text-base font-semibold`}>
                            Save All Changes
                        </button>
                    </div>
                </form>
            </main>
            <Footer />
        </div>
    );
}