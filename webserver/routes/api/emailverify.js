import express from 'express';
import pool from '../../config/db.js'; // Import kết nối DB
import { sendVerificationCodeEmail } from '../../utils/mailer.js';

const router = express.Router();

// -----------------------------------------------------------
// 1. Gửi mã xác thực (Send Code)
// -----------------------------------------------------------
router.post('/send-verification-code', async (req, res) => {
    try {
        const { target } = req.body; // target là email
        const userEmail = target;

        if (!userEmail) { 
            return res.status(400).json({ error: 'Email is required.' });
        }

        // Tạo mã 6 số
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Thời gian hết hạn: Hiện tại + 5 phút
        // MySQL cần định dạng Date Object hoặc chuỗi YYYY-MM-DD HH:mm:ss
        const codeExpires = new Date(Date.now() + 5 * 60 * 1000);

        const connection = await pool.getConnection();
        
        try {
            // 1. Kiểm tra User có tồn tại không
            const [users] = await connection.query("SELECT ID FROM User WHERE email = ?", [userEmail]);
            
            if (users.length === 0) {
                return res.status(404).json({ error: `No user found with email ${userEmail}` });
            }

            // 2. Lưu mã và thời gian hết hạn vào DB
            await connection.query(
                "UPDATE User SET verification_code = ?, verification_code_expires = ? WHERE email = ?",
                [verificationCode, codeExpires, userEmail]
            );

            // 3. Gửi Email
            const emailSent = await sendVerificationCodeEmail(userEmail, verificationCode);
            if (!emailSent) {
                throw new Error('Failed to send verification code email.');
            }

            return res.status(200).json({ message: 'Verification code has been sent to your email address.' });

        } finally {
            connection.release(); // Luôn giải phóng kết nối
        }

    } catch (error) {
        console.error("Send Code Error:", error);
        return res.status(500).json({ error: 'Failed to send verification code email.' });
    }
});

// -----------------------------------------------------------
// 2. Xác nhận mã (Confirm Code)
// -----------------------------------------------------------
router.post('/confirm-verification-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        const connection = await pool.getConnection();

        try {
            // 1. Lấy thông tin User (bao gồm mã và hạn) từ DB
            const [rows] = await connection.query(
                "SELECT * FROM User WHERE email = ?", 
                [email]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: `No user found with email ${email}` });
            }

            const user = rows[0];
            const currentTime = new Date();

            // 2. Kiểm tra mã và thời hạn
            // Lưu ý: user.verification_code_expires trả về Date Object, so sánh trực tiếp được
            if (!user.verification_code_expires || currentTime > user.verification_code_expires) {
                return res.status(400).json({ error: 'Verification code has expired.' });
            }

            if (user.verification_code !== code) {
                return res.status(400).json({ error: 'Incorrect verification code.' });
            }

            // 3. Update trạng thái verify thành công (verify_status = 1)
            // Đồng thời xóa mã code đi để không dùng lại được
            await connection.query(
                `UPDATE User SET 
                    verify_status = 1, 
                    verification_code = NULL, 
                    verification_code_expires = NULL 
                 WHERE email = ?`,
                [email]
            );

            // 4. Chuẩn bị object user để trả về
            // Frontend cũ mong đợi 'email_verify': 'verified'
            const updatedUser = {
                ...user,
                verify_status: 1,
                email_verify: 'verified', // Map cho khớp frontend cũ
                verification_code: null, // Ẩn code đi
                verification_code_expires: null
            };

            return res.status(200).json({ message: 'Verification successful!', user: updatedUser });

        } finally {
            connection.release();
        }

    } catch (err) {
        console.error("Confirm Code Error:", err);
        return res.status(500).json({ error: 'An unexpected error occurred while verifying the code.' });
    }
});

export default router;