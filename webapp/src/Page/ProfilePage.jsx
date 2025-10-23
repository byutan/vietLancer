import { useState } from 'react';
import Footer from "../Components/Footer";
import ProfileIcon from '../Public/profile_icon.svg';
const AddIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
);
const RemoveIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
const ChevronDownIcon = () => (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
);

export default function ProfilePage() {
    const [showPassword, setShowPassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [fileName, setFileName] = useState("No file chosen");
    const [personalInfo, setPersonalInfo] = useState({
        fullname: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        dob: '',
    });

    const handlePersonalInfoChange = (event) => {
        const { name, value } = event.target;
        setPersonalInfo(prevInfo => ({
            ...prevInfo,
            [name]: value,
        }));
    };
    const [languages, setLanguages] = useState([]);
    const [education, setEducation] = useState([]);
    const [experience, setExperience] = useState([]);
    const [showAddLanguage, setShowAddLanguage] = useState(false);
    const [showAddEducation, setShowAddEducation] = useState(false);
    const [showAddExperience, setShowAddExperience] = useState(false);
    const [newLanguage, setNewLanguage] = useState({ name: '', level: 'Beginner' });
    const [newEducation, setNewEducation] = useState({ school: '', degree: 'Bachelor', startYear: '', endYear: '' });
    const [newExperience, setNewExperience] = useState({ company: '', title: '', description: '', startYear: '', endYear: '' });
    const [openExperienceIndex, setOpenExperienceIndex] = useState(null);
    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setAvatarPreview(null);
            setFileName("No chosen file.");
        }
    };
    const handleNewLanguageChange = (e) => {
        const { name, value } = e.target;
        setNewLanguage(prev => ({ ...prev, [name]: value }));
    };
    const handleSaveNewLanguage = () => {
        if (!newLanguage.name) return; 
        setLanguages([...languages, newLanguage]);
        setNewLanguage({ name: '', level: 'Beginner' }); 
        setShowAddLanguage(false); 
    };
    const removeLanguage = (index) => {
        setLanguages(languages.filter((_, i) => i !== index));
    };
    const handleNewEducationChange = (e) => {
        const { name, value } = e.target;
        setNewEducation(prev => ({ ...prev, [name]: value }));
    };
    const handleSaveNewEducation = () => {
        if (!newEducation.school) return;
        setEducation([...education, newEducation]);
        setNewEducation({ school: '', degree: 'Bachelor', startYear: '', endYear: '' });
        setShowAddEducation(false);
    };
    const removeEducation = (index) => {
        setEducation(education.filter((_, i) => i !== index));
    };
    const handleNewExperienceChange = (e) => {
        const { name, value } = e.target;
        setNewExperience(prev => ({ ...prev, [name]: value }));
    };
    const handleSaveNewExperience = () => {
        if (!newExperience.company || !newExperience.title) return;
        setExperience([...experience, newExperience]);
        setNewExperience({ company: '', title: '', description: '', startYear: '', endYear: '' });
        setShowAddExperience(false);
    };
    const removeExperience = (index) => {
        setExperience(experience.filter((_, i) => i !== index));
    };
    const handleSaveAll = () => {
        const allData = {
            personalInfo: { ...personalInfo, avatar: avatarPreview },
            skills: { languages, education, experience }
        };
        console.log("Saving all data:", allData);
        alert("All changes saved! (Check console for data)");
    };
    const inputStyleLeft = "appearance-none block w-2/3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-base text-left";
    const labelStyleLeft = "block text-base font-medium text-gray-900 w-1/3";
    const inputStyleRight = "appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-base text-left";
    const selectStyleRight = inputStyleRight;
    const labelStyleRight = "block text-base font-medium text-gray-900 mb-2";

    const addButtonStyle = "w-full flex items-center justify-center py-3 px-6 border-2 border-dashed border-gray-300 text-base font-medium rounded-lg text-gray-600 hover:text-black hover:border-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors";
    const listItemStyle = "flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm";

    const addFormContainerStyle = "p-4 border rounded-lg space-y-4 bg-gray-50 mt-4";
    const saveButtonFormStyle = "px-4 py-2 text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800";
    const cancelButtonFormStyle = "px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300";

    return (
        <div className="font-poppins flex flex-col min-h-screen bg-white text-black">
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
                    <div className="w-full max-w-2xl space-y-8 text-left">
                        <h2 className="text-4xl font-extrabold text-gray-900">
                            Personal Information
                        </h2>

                        <div className="flex items-center space-x-6">
                            <label className={`${labelStyleLeft} text-base`}>
                                Avatar Preview
                            </label>
                            <div className="w-36 h-36 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden ring-2 ring-gray-300">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <img src={ProfileIcon} alt="Default Avatar" className="w-24 h-24 text-gray-400" />
                                )}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <label htmlFor="avatar-upload" className={labelStyleLeft}>
                                    Upload Photo
                                </label>
                                <div className="w-2/3">
                                    <input
                                        id="avatar-upload"
                                        name="avatar-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg, image/jpg, image/png"
                                        onChange={handleAvatarChange}
                                    />
                                    <div className="flex items-center space-x-4">
                                        <label
                                            htmlFor="avatar-upload"
                                            className="cursor-pointer rounded-lg border-0 bg-black px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-gray-800"
                                        >
                                            Choose File
                                        </label>
                                        <span className="text-base text-gray-600 truncate">
                                            {fileName}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Maximum of 10 MB JPEG, JPG or PNG file.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label htmlFor="fullname" className={labelStyleLeft}>Fullname</label>
                                <input id="fullname" name="fullname" type="text" autoComplete="name" required
                                    className={inputStyleLeft} placeholder="John Doe"
                                    value={personalInfo.fullname}
                                    onChange={handlePersonalInfoChange}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="dob" className={labelStyleLeft}>Date of Birth</label>
                                <input id="dob" name="dob" type="date"
                                    className={inputStyleLeft}
                                    value={personalInfo.dob}
                                    onChange={handlePersonalInfoChange}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <label htmlFor="email" className={labelStyleLeft}>Email</label>
                                <input id="email" name="email" type="email" autoComplete="email" required
                                    className={inputStyleLeft} placeholder="email@example.com"
                                    value={personalInfo.email}
                                    onChange={handlePersonalInfoChange}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className={labelStyleLeft}>Password</label>
                                <div className="relative w-2/3">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        className={inputStyleLeft}
                                        placeholder="••••••••"
                                        value={personalInfo.password}
                                        onChange={handlePersonalInfoChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-base leading-5 text-gray-600 hover:text-black focus:outline-none"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label htmlFor="phone" className={labelStyleLeft}>Phone Number</label>
                                <input id="phone" name="phone" type="tel" autoComplete="tel"
                                    className={inputStyleLeft} placeholder="123-456-7890"
                                    value={personalInfo.phone}
                                    onChange={handlePersonalInfoChange}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <label htmlFor="address" className={labelStyleLeft}>Address</label>
                                <input id="address" name="address" type="text" autoComplete="street-address"
                                    className={inputStyleLeft} placeholder="123 Main St, City, State"
                                    value={personalInfo.address}
                                    onChange={handlePersonalInfoChange}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-full max-w-2xl space-y-8 text-left">
                        <h2 className="text-4xl font-extrabold text-gray-900">
                            Skills & Experience
                        </h2>

                        <div className="space-y-12">
                            <section className="space-y-4">
                                <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2">
                                    Foreign Languages
                                </h3>
                                <div className="space-y-3">
                                    {languages.map((language, index) => (
                                        <div key={index} className={listItemStyle}>
                                            <div>
                                                <span className="font-semibold">{language.name}</span>
                                                <span className="text-gray-600"> - {language.level}</span>
                                            </div>
                                            <button type="button" onClick={() => removeLanguage(index)} className="text-gray-400 hover:text-red-500">
                                                <RemoveIcon />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {showAddLanguage && (
                                    <div className={addFormContainerStyle}>
                                        <div>
                                            <label htmlFor="lang-name" className={labelStyleRight}>Language Name</label>
                                            <input type="text" name="name" id="lang-name" className={inputStyleRight}
                                                value={newLanguage.name} onChange={handleNewLanguageChange} placeholder="E.g., English" />
                                        </div>
                                        <div>
                                            <label htmlFor="lang-level" className={labelStyleRight}>Level</label>
                                            <select name="level" id="lang-level" className={selectStyleRight}
                                                value={newLanguage.level} onChange={handleNewLanguageChange}>
                                                <option>Beginner</option>
                                                <option>Intermediate</option>
                                                <option>Expert</option>
                                            </select>
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                            <button type="button" onClick={() => setShowAddLanguage(false)} className={cancelButtonFormStyle}>Cancel</button>
                                            <button type="button" onClick={handleSaveNewLanguage} className={saveButtonFormStyle}>Save</button>
                                        </div>
                                    </div>
                                )}
                                {!showAddLanguage && (
                                    <button type="button" onClick={() => setShowAddLanguage(true)} className={addButtonStyle}>
                                        <AddIcon /> Add Language
                                    </button>
                                )}
                            </section>
                            <section className="space-y-4">
                                <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2">
                                    Education
                                </h3>
                                <div className="space-y-3">
                                    {education.map((edu, index) => (
                                        <div key={index} className={listItemStyle}>
                                            <div>
                                                <span className="font-semibold">{edu.school}</span>
                                                <span className="block text-gray-600 text-sm">{edu.degree} ({edu.startYear} - {edu.endYear})</span>
                                            </div>
                                            <button type="button" onClick={() => removeEducation(index)} className="text-gray-400 hover:text-red-500">
                                                <RemoveIcon />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {showAddEducation && (
                                    <div className={addFormContainerStyle}>
                                        <div>
                                            <label htmlFor="edu-school" className={labelStyleRight}>School / University</label>
                                            <input type="text" name="school" id="edu-school" className={inputStyleRight}
                                                value={newEducation.school} onChange={handleNewEducationChange} placeholder="E.g., Harvard University" />
                                        </div>
                                        <div>
                                            <label htmlFor="edu-degree" className={labelStyleRight}>Degree</label>
                                            <select name="degree" id="edu-degree" className={selectStyleRight}
                                                value={newEducation.degree} onChange={handleNewEducationChange}>
                                                <option>Bachelor</option>
                                                <option>Master</option>
                                                <option>Ph.D</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div className="flex space-x-4">
                                            <div className="w-1/2">
                                                <label htmlFor="edu-start" className={labelStyleRight}>Start Year</label>
                                                <input type="number" name="startYear" id="edu-start" className={inputStyleRight}
                                                    value={newEducation.startYear} onChange={handleNewEducationChange} placeholder="2018" />
                                            </div>
                                            <div className="w-1/2">
                                                <label htmlFor="edu-end" className={labelStyleRight}>End Year</label>
                                                <input type="number" name="endYear" id="edu-end" className={inputStyleRight}
                                                    value={newEducation.endYear} onChange={handleNewEducationChange} placeholder="2022" />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                            <button type="button" onClick={() => setShowAddEducation(false)} className={cancelButtonFormStyle}>Cancel</button>
                                            <button type="button" onClick={handleSaveNewEducation} className={saveButtonFormStyle}>Save</button>
                                        </div>
                                    </div>
                                )}
                                {!showAddEducation && (
                                    <button type="button" onClick={() => setShowAddEducation(true)} className={addButtonStyle}>
                                        <AddIcon /> Add Education
                                    </button>
                                )}
                            </section>
                            <section className="space-y-4">
                                <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2">
                                    Work Experience
                                </h3>
                                <div className="space-y-3">
                                    {experience.map((exp, index) => (
                                        <div key={index} className="border rounded-lg bg-white shadow-sm overflow-hidden">
                                            <div
                                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                                onClick={() => setOpenExperienceIndex(openExperienceIndex === index ? null : index)}
                                            >
                                                <div>
                                                    <span className="font-semibold">{exp.title}</span>
                                                    <span className="text-gray-600"> at {exp.company}</span>
                                                    <span className="block text-gray-600 text-sm">({exp.startYear} - {exp.endYear})</span>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); removeExperience(index); }} className="text-gray-400 hover:text-red-500">
                                                        <RemoveIcon />
                                                    </button>
                                                    <ChevronDownIcon />
                                                </div>
                                            </div>
                                            {openExperienceIndex === index && (
                                                <div className="p-4 border-t border-gray-200 bg-gray-50">
                                                    <p className="text-base text-gray-700 whitespace-pre-wrap">{exp.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {showAddExperience && (
                                    <div className={addFormContainerStyle}>
                                        <div>
                                            <label htmlFor="exp-company" className={labelStyleRight}>Company Name</label>
                                            <input type="text" name="company" id="exp-company" className={inputStyleRight}
                                                value={newExperience.company} onChange={handleNewExperienceChange} placeholder="E.g., Google" />
                                        </div>
                                        <div>
                                            <label htmlFor="exp-title" className={labelStyleRight}>Job Title</label>
                                            <input type="text" name="title" id="exp-title" className={inputStyleRight}
                                                value={newExperience.title} onChange={handleNewExperienceChange} placeholder="E.g., Senior Software Engineer" />
                                        </div>
                                        <div>
                                            <label htmlFor="exp-desc" className={labelStyleRight}>Description</label>
                                            <textarea name="description" id="exp-desc" rows="4" className={inputStyleRight}
                                                value={newExperience.description} onChange={handleNewExperienceChange} placeholder="Describe your responsibilities..." />
                                        </div>
                                        <div className="flex space-x-4">
                                            <div className="w-1/2">
                                                <label htmlFor="exp-start" className={labelStyleRight}>Start Year</label>
                                                <input type="number" name="startYear" id="exp-start" className={inputStyleRight}
                                                    value={newExperience.startYear} onChange={handleNewExperienceChange} placeholder="2022" />
                                            </div>
                                            <div className="w-1/2">
                                                <label htmlFor="exp-end" className={labelStyleRight}>End Year</label>
                                                <input type="number" name="endYear" id="exp-end" className={inputStyleRight}
                                                    value={newExperience.endYear} onChange={handleNewExperienceChange} placeholder="Present" />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                            <button type="button" onClick={() => setShowAddExperience(false)} className={cancelButtonFormStyle}>Cancel</button>
                                            <button type="button" onClick={handleSaveNewExperience} className={saveButtonFormStyle}>Save</button>
                                        </div>
                                    </div>
                                )}
                                {!showAddExperience && (
                                    <button type="button" onClick={() => setShowAddExperience(true)} className={addButtonStyle}>
                                        <AddIcon /> Add Experience
                                    </button>
                                )}
                            </section>

                        </div>
                    </div>
                </div>
                <div className="flex justify-center pt-16">
                    <button
                        type="button"
                        onClick={handleSaveAll}
                        className="group w-full sm:w-auto max-w-md flex justify-center py-4 px-12 border border-transparent text-lg font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                        Save All Changes
                    </button>
                </div>

            </main>
            <Footer />
        </div>
    )
}