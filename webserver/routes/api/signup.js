import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Thư viện để mã hóa mật khẩu
import pool from '../../config/db.js'; // Import kết nối DB

const router = express.Router();

router.post('/signup', async (req, res) => {
    // 1. Lấy kết nối từ pool để dùng Transaction
    const connection = await pool.getConnection();

    try {
        const { name, email, password, role } = req.body;
        
        // Log kiểm tra (có thể xóa sau này)
        console.log("Incoming register request:", { name, email, role });

        // Validate cơ bản
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin.' });
        }

        // 2. Kiểm tra Email đã tồn tại chưa
        const [existingUser] = await connection.query(
            "SELECT ID FROM User WHERE email = ?", 
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email đã được đăng ký.' });
        }

        // 3. Mã hóa mật khẩu (Không bao giờ lưu password gốc)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // --- BẮT ĐẦU GIAO DỊCH (TRANSACTION) ---
        await connection.beginTransaction();

        // 4. Insert vào bảng USER trước
        // Lưu ý: verify_status mặc định là 0 (false) tương ứng với 'unverified'
        const [insertUserResult] = await connection.query(
            `INSERT INTO User (email, password, full_name, verify_status) 
             VALUES (?, ?, ?, ?)`,
            [email, hashedPassword, name, 0]
        );

        const newUserId = insertUserResult.insertId; // Lấy ID vừa tạo

        // 5. Insert vào bảng Role tương ứng (Freelancer hoặc Client)
        if (role === 'freelancer') {
            await connection.query(
                "INSERT INTO Freelancer (freelancer_ID) VALUES (?)", 
                [newUserId]
            );
        } else if (role === 'client') {
            await connection.query(
                "INSERT INTO Client (client_ID) VALUES (?)", 
                [newUserId]
            );
        } else {
            // Nếu role gửi lên không đúng, rollback và báo lỗi
            throw new Error("Invalid role specified");
        }

        // --- LƯU GIAO DỊCH (COMMIT) ---
        await connection.commit();

        // 6. Tạo JWT Token
        // Payload nên chứa ID và Role để tiện phân quyền sau này
        const payload = {
            id: newUserId,
            email: email,
            role: role,
            name: name,
            email_verify: 'unverified'
        };

        const secretKey = process.env.JWT_SECRET || 'secret_mac_dinh'; // Fallback nếu chưa config .env
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

        // 7. Trả về kết quả
        // Lưu ý: Không trả về password trong response
        const userResponse = {
            id: newUserId,
            name,
            email,
            role,
            verify_status: false,
            // Các trường skill, phone, address lúc đăng ký chưa có thì trả về null hoặc rỗng
            phone: '',
            address: '',
            avatar: ''
        };

        return res.status(201).json({ 
            message: 'Đăng ký thành công.',
            token: token,
            user: userResponse
        });

    } catch (error) {
        // Nếu có lỗi, hoàn tác tất cả thay đổi trong DB
        await connection.rollback();
        
        console.error("Signup Error:", error);
        return res.status(500).json({ error: 'Lỗi server, vui lòng thử lại sau.' });
    } finally {
        // Luôn luôn giải phóng kết nối
        connection.release();
    }
});

export default router;