import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../ContextAPI/AuthContext';

const ProjectPosting = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const hasChecked = useRef(false);
    const [isCheckingAccess, setIsCheckingAccess] = useState(true);

    const [projectData, setProjectData] = useState({
        title: '',
        description: '',
        budget: '',
        duration: '',
        paymentMethod: '',
        workFormat: '',
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
                alert('Vui lòng đăng nhập để truy cập trang này');
                navigate('/SignInPage');
                return;
            }
            
            if (user.role !== 'client') {
                alert('Chỉ Khách hàng mới có quyền đăng tin dự án');
                navigate('/HomePage');
                return;
            }
            
            setIsCheckingAccess(false);
        };

        checkAccess();
    }, [user, navigate]);

    if (isCheckingAccess) {
        return (
            <div style={{ 
                padding: '50px', 
                textAlign: 'center',
                minHeight: '100vh',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
            }}>
                <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
                <p style={{ color: '#7f8c8d', fontSize: '1.2rem' }}>Đang kiểm tra quyền truy cập...</p>
            </div>
        );
    }

    if (!user || user.role !== 'client') {
        return (
            <div style={{ 
                padding: '50px', 
                textAlign: 'center',
                minHeight: '100vh',
                backgroundColor: '#f8f9fa'
            }}>
                <h1 style={{ color: '#e74c3c', fontSize: '2rem', marginBottom: '20px' }}> Truy cập bị từ chối</h1>
                <p style={{ color: '#7f8c8d', fontSize: '1.2rem' }}>Chỉ Khách hàng mới có quyền đăng tin dự án</p>
                <button 
                    onClick={() => navigate('/HomePage')}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Quay về trang chủ
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
        
        // Clear error khi user bắt đầu nhập
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // ✅ Xử lý thêm skill dạng tag
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

    // ✅ Xử lý nhập từ bàn phím
    const handleSkillInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddSkill(skillInput);
        }
    };

    // ✅ Xóa skill
    const handleRemoveSkill = (skillToRemove) => {
        setProjectData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!projectData.title.trim()) newErrors.title = 'Tên dự án là bắt buộc';
        else if (projectData.title.trim().length < 5) newErrors.title = 'Tên dự án phải có ít nhất 5 ký tự';
        
        if (!projectData.description.trim()) newErrors.description = 'Mô tả dự án là bắt buộc';
        else if (projectData.description.trim().length < 20) newErrors.description = 'Mô tả phải có ít nhất 20 ký tự';
        
        if (!projectData.budget || projectData.budget <= 0) newErrors.budget = 'Ngân sách phải lớn hơn 0';
        else if (projectData.budget > 100000000000) newErrors.budget = 'Ngân sách không được vượt quá 100 tỷ VND';
        
        if (!projectData.duration) newErrors.duration = 'Thời gian thực hiện là bắt buộc';
        else if (projectData.duration < 1) newErrors.duration = 'Thời gian phải ít nhất 1 ngày';
        else if (projectData.duration > 365) newErrors.duration = 'Thời gian không được vượt quá 365 ngày';
        
        if (!projectData.category) newErrors.category = 'Danh mục là bắt buộc';
        
        // ✅ Validation cho phương thức thanh toán
        if (!projectData.paymentMethod) newErrors.paymentMethod = 'Phương thức thanh toán là bắt buộc';
        
        // ✅ Validation cho hình thức làm việc
        if (!projectData.workFormat) newErrors.workFormat = 'Hình thức làm việc là bắt buộc';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            alert('Vui lòng kiểm tra lại thông tin đã nhập!');
            return;
        }

        const isBackendRunning = await checkBackendConnection();
        if (!isBackendRunning) {
            alert(' Backend server chưa chạy!\n\nHãy chạy lệnh trong terminal:\ncd server\nnpm install\nnpm run dev');
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
                    clientName: user.name || 'Khách hàng',
                    clientEmail: user.email || 'client@example.com',
                    status: 'pending',
                    createdAt: new Date().toISOString()
                })
            });

            const result = await response.json();

            if (result.success) {
                alert(' Đăng tin dự án thành công!\n\nTin đang chờ quản trị viên duyệt.');
                // Reset form
                setProjectData({
                    title: '',
                    description: '',
                    budget: '',
                    duration: '',
                    paymentMethod: '',
                    workFormat: '',
                    category: '',
                    skills: []
                });
                setSkillInput('');
                navigate('/HomePage');
            } else {
                alert(` Lỗi từ server: ${result.message || 'Không thể đăng tin dự án'}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert(' Có lỗi xảy ra khi đăng tin dự án: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ Danh sách phương thức thanh toán
    const paymentMethods = [
        { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
        { value: 'cash', label: 'Tiền mặt' },
    ];

    // ✅ Danh sách hình thức làm việc
    const workFormats = [
        { value: 'Online', label: 'Online' },
        { value: 'Offline', label: 'Offline' },
        { value: 'Both', label: 'Cả hai' },
        { value: 'Other', label: 'Khác' }
    ];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>ĐĂNG TIN DỰ ÁN MỚI</h1>
                <p style={styles.subtitle}>Điền đầy đủ thông tin để tìm freelancer phù hợp</p>
                <div style={styles.userInfo}>
                    <small>Đăng tin với tư cách: <strong>{user.name}</strong> (Khách hàng)</small>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Tên dự án </label>
                    <input
                        type="text"
                        name="title"
                        value={projectData.title}
                        onChange={handleChange}
                        placeholder="Nhập tên dự án"
                        style={{...styles.input, ...(errors.title ? styles.error : {})}}
                    />
                    {errors.title && <span style={styles.errorMessage}>{errors.title}</span>}
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Mô tả dự án </label>
                    <textarea
                        name="description"
                        value={projectData.description}
                        onChange={handleChange}
                        placeholder="Mô tả chi tiết về dự án, mục tiêu, và yêu cầu cụ thể..."
                        rows="5"
                        style={{...styles.textarea, ...(errors.description ? styles.error : {})}}
                    />
                    {errors.description && <span style={styles.errorMessage}>{errors.description}</span>}
                    <small style={styles.helpText}>Ít nhất 20 ký tự</small>
                </div>

                <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Ngân sách (VND) </label>
                        <input
                            type="number"
                            name="budget"
                            value={projectData.budget}
                            onChange={handleChange}
                            placeholder="Nhập ngân sách"
                            min="1000000"
                            max="1000000000"
                            style={{...styles.input, ...(errors.budget ? styles.error : {})}}
                        />
                        {errors.budget && <span style={styles.errorMessage}>{errors.budget}</span>}
                        <small style={styles.helpText}>Tối thiểu 1 triệu VND</small>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Thời gian (ngày) </label>
                        <input
                            type="number"
                            name="duration"
                            value={projectData.duration}
                            onChange={handleChange}
                            placeholder="Số ngày thực hiện"
                            min="1"
                            max="365"
                            style={{...styles.input, ...(errors.duration ? styles.error : {})}}
                        />
                        {errors.duration && <span style={styles.errorMessage}>{errors.duration}</span>}
                        <small style={styles.helpText}>Tối đa 1 năm</small>
                    </div>
                </div>

                {/* ✅ Hàng cho phương thức thanh toán và hình thức làm việc */}
                <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Phương thức thanh toán </label>
                        <select 
                            name="paymentMethod" 
                            value={projectData.paymentMethod} 
                            onChange={handleChange}
                            style={{...styles.select, ...(errors.paymentMethod ? styles.error : {})}}
                        >
                            <option value="">Chọn phương thức thanh toán</option>
                            {paymentMethods.map(method => (
                                <option key={method.value} value={method.value}>
                                    {method.label}
                                </option>
                            ))}
                        </select>
                        {errors.paymentMethod && <span style={styles.errorMessage}>{errors.paymentMethod}</span>}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Hình thức làm việc </label>
                        <select 
                            name="workFormat" 
                            value={projectData.workFormat} 
                            onChange={handleChange}
                            style={{...styles.select, ...(errors.workFormat ? styles.error : {})}}
                        >
                            <option value="">Chọn hình thức làm việc</option>
                            {workFormats.map(format => (
                                <option key={format.value} value={format.value}>
                                    {format.label}
                                </option>
                            ))}
                        </select>
                        {errors.workFormat && <span style={styles.errorMessage}>{errors.workFormat}</span>}
                    </div>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Danh mục </label>
                    <select 
                        name="category" 
                        value={projectData.category} 
                        onChange={handleChange}
                        style={{...styles.select, ...(errors.category ? styles.error : {})}}
                    >
                        <option value="">Chọn danh mục</option>
                        <option value="web development">Phát triển Web</option>
                        <option value="Mobile development">Ứng dụng di động</option>
                        <option value="Embedded Engineering">Lập trình nhúng</option>
                        <option value="UI/UX Design">Thiết kế UI/UX</option>
                        <option value="Quality Assurance">Kỹ sư đảm bảo chất lượng</option>
                        <option value="Project Management">Quản lý dự án</option>
                        <option value="DevOps Engineering">Kỹ sư phát triển</option>
                        <option value="Digital Security">Bảo vệ dữ liệu</option>
                    </select>
                    {errors.category && <span style={styles.errorMessage}>{errors.category}</span>}
                </div>

                {/* ✅ Phần kỹ năng dạng tags (đã bỏ phần kỹ năng phổ biến) */}
                <div style={styles.formGroup}>
                    <label style={styles.label}>Kỹ năng cần thiết </label>
                    
                    {/* Input để thêm skill mới */}
                    <div style={styles.skillInputContainer}>
                        <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={handleSkillInputKeyDown}
                            placeholder="Nhập kỹ năng"
                            style={styles.input}
                        />
                        <button 
                            type="button"
                            onClick={() => handleAddSkill(skillInput)}
                            style={styles.addSkillButton}
                        >
                            Thêm
                        </button>
                    </div>
                    
                    {/* Hiển thị tags đã thêm */}
                    <div style={styles.tagsContainer}>
                        {projectData.skills.map((skill, index) => (
                            <div key={index} style={styles.tag}>
                                <span>{skill}</span>
                                <button 
                                    type="button"
                                    onClick={() => handleRemoveSkill(skill)}
                                    style={styles.removeTagButton}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    <small style={styles.helpText}>Nhập kỹ năng </small>
                </div>

                <div style={styles.formActions}>
                    <button 
                        type="button" 
                        onClick={() => navigate('/HomePage')}
                        style={styles.cancelButton}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        style={{
                            ...styles.submitButton,
                            ...(isSubmitting ? styles.disabledButton : {})
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <span style={{marginRight: '8px'}}></span>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <span style={{marginRight: '8px'}}></span>
                                Đăng Tin Dự Án
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Inline styles với style cho tags
const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '30px 20px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        minHeight: '100vh'
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '20px',
    },
    title: {
        color: '#2c3e50',
        fontSize: '2.5rem',
        marginBottom: '10px',
        fontWeight: '700',
    },
    subtitle: {
        color: '#7f8c8d',
        fontSize: '1.2rem',
        marginBottom: '10px',
    },
    userInfo: {
        color: '#3498db',
        fontSize: '0.9rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '25px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    label: {
        fontWeight: '600',
        marginBottom: '8px',
        color: '#34495e',
        fontSize: '1rem',
    },
    input: {
        padding: '12px 15px',
        border: '2px solid #e1e8ed',
        borderRadius: '8px',
        fontSize: '16px',
        transition: 'all 0.3s ease',
        backgroundColor: '#fafbfc',
    },
    textarea: {
        padding: '12px 15px',
        border: '2px solid #e1e8ed',
        borderRadius: '8px',
        fontSize: '16px',
        transition: 'all 0.3s ease',
        backgroundColor: '#fafbfc',
        fontFamily: 'inherit',
        resize: 'vertical',
    },
    select: {
        padding: '12px 15px',
        border: '2px solid #e1e8ed',
        borderRadius: '8px',
        fontSize: '16px',
        transition: 'all 0.3s ease',
        backgroundColor: '#fafbfc',
    },
    // ✅ Styles cho phần tags
    skillInputContainer: {
        display: 'flex',
        gap: '10px',
        marginBottom: '10px',
    },
    addSkillButton: {
        padding: '12px 20px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        minWidth: '80px',
    },
    tagsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '10px',
    },
    tag: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: '#e3f2fd',
        border: '1px solid #bbdefb',
        borderRadius: '20px',
        fontSize: '14px',
        color: '#1976d2',
    },
    removeTagButton: {
        background: 'none',
        border: 'none',
        color: '#f44336',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        padding: '0',
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    error: {
        borderColor: '#e74c3c',
        backgroundColor: '#fdf2f2',
    },
    errorMessage: {
        color: '#e74c3c',
        fontSize: '0.875rem',
        marginTop: '5px',
        fontWeight: '500',
    },
    helpText: {
        color: '#7f8c8d',
        fontSize: '0.875rem',
        marginTop: '5px',
        fontStyle: 'italic',
    },
    formRow: {
        display: 'flex',
        gap: '20px',
    },
    formActions: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'flex-end',
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #724d4dd1',
    },
    submitButton: {
        background: 'linear-gradient(135deg, #010c06ff, #0b0c0bff)',
        color: 'white',
        padding: '14px 35px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        minWidth: '160px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancelButton: {
        background: '#010e0fff',
        color: 'white',
        padding: '14px 30px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    disabledButton: {
        background: '#bdc3c7',
        cursor: 'not-allowed',
        opacity: 0.7,
    },
};

export default ProjectPosting;
