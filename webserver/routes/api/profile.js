import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../../config/db.js'; // Import kết nối DB

const router = express.Router();

router.put('/profile', async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided.' });
    }

    const secretKey = process.env.JWT_SECRET || 'secret_mac_dinh';
    let decoded;

    // 1. Xác thực Token
    try {
        decoded = jwt.verify(token, secretKey);
    } catch {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }

    const { personalInfo, skills } = req.body;

    // Validate dữ liệu đầu vào
    if (!personalInfo || !skills) {
        return res.status(400).json({ error: 'Missing personalInfo or skills in request body.' });
    }

    const connection = await pool.getConnection();

    try {
        // --- BẮT ĐẦU TRANSACTION ---
        await connection.beginTransaction();

        const userId = decoded.id; // Lấy ID từ token (lưu ý: token cũ phải có field 'id')

        // 2. Cập nhật bảng USER (Thông tin cá nhân)
        let updateQuery = `
            UPDATE User SET 
            full_name = ?, 
            email = ?, 
            phone_number = ?, 
            address = ?, 
            date_of_birth = ?,
            sex = ? -- Thêm sex nếu frontend có gửi lên
        `;
        
        const updateParams = [
            personalInfo.fullname,
            personalInfo.email,
            personalInfo.phone,
            personalInfo.address,
            personalInfo.dob ? new Date(personalInfo.dob) : null, // Convert date
            personalInfo.sex || null
        ];

        // Nếu có đổi mật khẩu thì Hash lại
        if (personalInfo.password && personalInfo.password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(personalInfo.password, salt);
            updateQuery += `, password = ?`;
            updateParams.push(hashedPassword);
        }

        updateQuery += ` WHERE ID = ?`;
        updateParams.push(userId);

        await connection.query(updateQuery, updateParams);

        // 3. Cập nhật SKILLS (Chỉ dành cho Freelancer)
        // Vì cấu trúc JSON cũ gộp chung, ta cần check xem userId này có phải Freelancer không
        // Tuy nhiên, để đơn giản, ta cứ thử xóa và insert vào các bảng skill. 
        // Nếu user không phải freelancer (không có constraint foreign key bên bảng con), nó vẫn chạy nhưng vô nghĩa.
        // Tốt nhất là check Role hoặc cứ thực hiện logic: Delete Old -> Insert New.

        // --- XỬ LÝ LANGUAGES ---
        if (skills.languages && Array.isArray(skills.languages)) {
            // Xóa hết language cũ của user này
            await connection.query("DELETE FROM Foreign_Language WHERE freelancerID = ?", [userId]);
            
            // Insert language mới
            for (let i = 0; i < skills.languages.length; i++) {
                const lang = skills.languages[i];
                // Lưu ý: langID trong bảng Foreign_Language là khóa chính cùng freelancerID.
                // Ta có thể dùng biến đếm i làm ID giả định.
                await connection.query(
                    "INSERT INTO Foreign_Language (freelancerID, langID, language, level) VALUES (?, ?, ?, ?)",
                    [userId, i + 1, lang.language, lang.level]
                );
            }
        }

        // --- XỬ LÝ EDUCATION ---
        if (skills.education && Array.isArray(skills.education)) {
            await connection.query("DELETE FROM Education WHERE freelancerID = ?", [userId]);
            
            for (let i = 0; i < skills.education.length; i++) {
                const edu = skills.education[i];
                await connection.query(
                    `INSERT INTO Education (freelancerID, eduID, school_name, major, degree, start_year, end_year) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [userId, i + 1, edu.school, edu.major, edu.degree, edu.from, edu.to] 
                    // Lưu ý: mapping tên trường từ JSON (school, from, to) sang DB (school_name, start_year...)
                );
            }
        }

        // --- XỬ LÝ EXPERIENCE ---
        if (skills.experience && Array.isArray(skills.experience)) {
            await connection.query("DELETE FROM Experience WHERE freelancerID = ?", [userId]);
            
            for (let i = 0; i < skills.experience.length; i++) {
                const exp = skills.experience[i];
                await connection.query(
                    `INSERT INTO Experience (freelancerID, expID, company_name, job_title, exp_desc, start_year, end_year) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [userId, i + 1, exp.company, exp.position, exp.description, exp.from, exp.to]
                );
            }
        }

        // --- COMMIT TRANSACTION ---
        await connection.commit();

        // 4. Tạo Token mới với thông tin đã cập nhật
        // (Để frontend cập nhật lại state ngay lập tức mà không cần gọi API lấy profile lại)
        const newPayload = {
            id: userId,
            email: personalInfo.email,
            name: personalInfo.fullname,
            role: decoded.role, // Giữ nguyên role cũ từ token cũ
            phone: personalInfo.phone,
            address: personalInfo.address,
            dob: personalInfo.dob,
            email_verify: 'verified', // Database lưu boolean, nhưng token trả về string cho frontend cũ vui
            avatar: personalInfo.avatar || '',
            skills: skills // Trả lại đúng cái frontend vừa gửi lên
        };

        const newToken = jwt.sign(newPayload, secretKey, { expiresIn: '1h' });

        return res.status(200).json({
            message: 'Profile updated successfully.',
            user: {
                ...newPayload,
                verify_status: 1 // Mapping lại cho khớp response mong đợi
            },
            token: newToken,
        });

    } catch (error) {
        await connection.rollback(); // Hoàn tác nếu lỗi
        console.error("Update Profile Error:", error);
        return res.status(500).json({ error: 'Failed to update profile.', details: error.message });
    } finally {
        connection.release();
    }
});

export default router;