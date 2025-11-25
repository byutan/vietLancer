import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../../config/db.js';

const router = express.Router();

router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body; // Frontend gửi 'email', nhưng Admin sẽ nhập 'login_name' vào ô này

        if (!email || !password) {
            return res.status(400).json({ error: 'Vui lòng nhập tài khoản và mật khẩu.' });
        }

        const connection = await pool.getConnection();

        try {
            // ===============================================
            // BƯỚC 1: KIỂM TRA BẢNG USER (Freelancer/Client)
            // ===============================================
            const userQuery = `
                SELECT u.*,
                    CASE 
                        WHEN f.freelancer_ID IS NOT NULL THEN 'freelancer' -- Sửa về chữ thường cho khớp Frontend
                        WHEN c.client_ID IS NOT NULL THEN 'client'
                        ELSE 'unknown'
                    END as role
                FROM User u
                LEFT JOIN Freelancer f ON u.ID = f.freelancer_ID
                LEFT JOIN Client c ON u.ID = c.client_ID
                WHERE u.email = ?
            `;
            const [users] = await connection.query(userQuery, [email]);

            // Nếu tìm thấy trong bảng User -> Xử lý đăng nhập bình thường
            if (users.length > 0) {
                const user = users[0];
                const isMatch = await bcrypt.compare(password, user.password);
                
                if (isMatch) {
                    const payload = {
                        id: user.ID,
                        email: user.email,
                        role: user.role, // role freelancer/client
                        name: user.full_name,
                        email_verify: user.verify_status === 1 ? 'verified' : 'unverified'
                    };
                    return sendTokenResponse(res, payload, user, user.role);
                }
            }

            // ===============================================
            // BƯỚC 2: KIỂM TRA BẢNG ADMIN (Nếu không phải User)
            // ===============================================
            // Lưu ý: Admin đăng nhập bằng login_name, nhưng frontend đang gửi biến tên là 'email'
            const adminQuery = "SELECT * FROM Admin WHERE login_name = ?";
            const [admins] = await connection.query(adminQuery, [email]);

            if (admins.length > 0) {
                const admin = admins[0];
                const isMatch = await bcrypt.compare(password, admin.password);

                if (isMatch) {
                    const payload = {
                        id: admin.admin_ID, // ID của bảng Admin
                        email: admin.login_name, // Admin không có email, dùng login_name thay thế
                        role: 'admin', // Đặt role là 'moderator' hoặc 'admin' để Frontend nhận diện
                        name: 'Administrator'
                    };
                    
                    // Tạo cấu trúc user trả về cho khớp Frontend
                    const adminResponseObj = {
                        ID: admin.admin_ID,
                        full_name: 'System Administrator',
                        email: admin.login_name,
                        phone_number: '',
                        address: 'System',
                        verify_status: 1,
                        date_of_birth: null
                    };

                    return sendTokenResponse(res, payload, adminResponseObj, 'admin');
                }
            }

            // Nếu chạy hết cả 2 bảng mà không khớp
            return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không đúng.' });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Signin Error:", error);
        return res.status(500).json({ error: 'Lỗi kết nối server.' });
    }
});

// Hàm phụ trợ để gửi phản hồi (cho gọn code)
const sendTokenResponse = (res, payload, userDB, roleName) => {
    const secretKey = process.env.JWT_SECRET || 'secret_mac_dinh';
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

    const userResponse = {
        id: payload.id,
        name: userDB.full_name || 'Admin',
        email: payload.email,
        role: roleName,
        phone: userDB.phone_number || '',
        address: userDB.address || '',
        dob: userDB.date_of_birth || '',
        email_verify: 'verified', // Admin mặc định là verified
        verify_status: 1,
        avatar: '',
        skills: { languages: [], education: [], experience: [] }
    };

    return res.status(200).json({
        message: 'Đăng nhập thành công.',
        token: token,
        user: userResponse,
    });
};

export default router;