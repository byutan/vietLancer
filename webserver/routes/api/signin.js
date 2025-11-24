import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../../config/db.js';

const router = express.Router();

router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Kiểm tra đầu vào
        if (!email || !password) {
            return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu.' });
        }

        // 2. Truy vấn Database để tìm User và xác định Role
        // Chúng ta dùng LEFT JOIN để xem ID này nằm bên Freelancer hay Client
        const query = `
            SELECT 
                u.*,
                CASE 
                    WHEN f.freelancer_ID IS NOT NULL THEN 'Freelancer'
                    WHEN c.client_ID IS NOT NULL THEN 'Client'
                    ELSE 'Admin' -- Hoặc 'Unknown' tùy logic
                END as role
            FROM User u
            LEFT JOIN Freelancer f ON u.ID = f.freelancer_ID
            LEFT JOIN Client c ON u.ID = c.client_ID
            WHERE u.email = ?
        `;

        const [rows] = await pool.query(query, [email]);

        // Nếu không tìm thấy user
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
        }

        const user = rows[0];

        // 3. So sánh mật khẩu (Hash comparison)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
        }

        // 4. Chuẩn bị dữ liệu để tạo Token và trả về
        // Lưu ý: Database dùng 'full_name', 'phone_number', nhưng frontend cũ dùng 'name', 'phone'
        // Ta cần map lại cho đúng để frontend không bị lỗi.
        
        const payload = {
            id: user.ID, // Thêm ID vào token để tiện dùng sau này
            email: user.email,
            role: user.role,
            name: user.full_name,
        };

        const secretKey = process.env.JWT_SECRET || 'secret_mac_dinh';
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

        // Tạo object user để trả về client (ẩn password đi)
        const userResponse = {
            id: user.ID,
            name: user.full_name,
            email: user.email,
            role: user.role,
            phone: user.phone_number,
            address: user.address,
            dob: user.date_of_birth,
            email_verify: user.verify_status === 1 ? 'verified' : 'unverified', // Convert lại cho giống cũ
            avatar: '', // Database chưa có cột avatar, tạm để rỗng
            
            // Lưu ý: Việc lấy skills (Education, Exp, Language) tốn nhiều tài nguyên
            // Tốt nhất là khi login chỉ trả về info cơ bản. 
            // Skills nên được gọi ở API lấy profile riêng.
            skills: { 
                languages: [], 
                education: [], 
                experience: [] 
            }
        };

        return res.status(200).json({
            message: 'Đăng nhập thành công.',
            token: token,
            user: userResponse,
        });

    } catch (error) {
        console.error("Signin Error:", error);
        return res.status(500).json({ error: 'Lỗi kết nối server.' });
    }
});

export default router;