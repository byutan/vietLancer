// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// // Đảm bảo load biến môi trường
// dotenv.config();

// // Tạo Transporter ra ngoài hàm để không khởi tạo lại mỗi lần gửi (tối ưu hiệu năng)
// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,            // Sử dụng Port 465 (SSL) thay vì 587
//     secure: true,         // Bắt buộc true với port 465
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     },
//     // Thêm timeout để tránh request bị treo quá lâu
//     connectionTimeout: 10000, 
//     greetingTimeout: 5000
// });

// export async function sendVerificationCodeEmail(to, verificationCode) {
//     const mailOptions = {
//         from: `"VietLancer Support" <${process.env.EMAIL_USER}>`, 
//         to: to,                      
//         subject: 'Mã xác thực VietLancer',
//         // Dùng HTML nhìn cho chuyên nghiệp hơn, fallback về text nếu lỗi font
//         html: `
//             <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
//                 <h2 style="color: #2c3e50;">Mã xác thực VietLancer</h2>
//                 <p>Xin chào,</p>
//                 <p>Mã xác thực của bạn là:</p>
//                 <h1 style="color: #27ae60; letter-spacing: 5px;">${verificationCode}</h1>
//                 <p>Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này.</p>
//             </div>
//         `,
//         text: `Mã xác thực của bạn là: ${verificationCode}. Mã hết hạn sau 5 phút.`
//     };

//     try {
//         const info = await transporter.sendMail(mailOptions);
//         console.log('Verification email sent: ' + info.response);
//         return true;
//     } catch (error) {
//         console.error('Error sending email:', error);
//         return false;
//     }
// }


import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationCodeEmail = async (toEmail, code) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // Email mặc định của Resend (dùng cái này mới gửi được Free)
            to: toEmail,
            subject: 'Mã xác thực VietLancer',
            html: `<p>Mã xác thực của bạn là: <strong>${code}</strong></p>`
        });

        if (error) {
            console.error("Resend Error:", error);
            return false;
        }
        return true;
    } catch (err) {
        console.error("Resend Exception:", err);
        return false;
    }
};