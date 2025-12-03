import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Đảm bảo load biến môi trường
dotenv.config();

// Tạo Transporter ra ngoài hàm để không khởi tạo lại mỗi lần gửi (tối ưu hiệu năng)
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,            // Sử dụng Port 465 (SSL) thay vì 587
    secure: true,         // Bắt buộc true với port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Thêm timeout để tránh request bị treo quá lâu
    connectionTimeout: 10000, 
    greetingTimeout: 5000
});

export async function sendVerificationCodeEmail(to, verificationCode) {
    const mailOptions = {
        from: `"VietLancer Support" <${process.env.EMAIL_USER}>`, 
        to: to,                      
        subject: 'Mã xác thực VietLancer',
        // Dùng HTML nhìn cho chuyên nghiệp hơn, fallback về text nếu lỗi font
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
                <h2 style="color: #2c3e50;">Mã xác thực VietLancer</h2>
                <p>Xin chào,</p>
                <p>Mã xác thực của bạn là:</p>
                <h1 style="color: #27ae60; letter-spacing: 5px;">${verificationCode}</h1>
                <p>Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này.</p>
            </div>
        `,
        text: `Mã xác thực của bạn là: ${verificationCode}. Mã hết hạn sau 5 phút.`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}


// import nodemailer from 'nodemailer';

// export async function sendVerificationCodeEmail(to, verificationCode) {
//     const transporter = nodemailer.createTransport({
//         service: 'gmail', 
//         auth: {
//             user: process.env.EMAIL_USER, 
//             pass: process.env.EMAIL_PASS  
//         }
//     });

//     const mailOptions = {
//         from: process.env.EMAIL_USER, 
//         to: to,                      
//         subject: 'Verification Code',
//         text: `Your verification code is: ${verificationCode}. This code will expire in 5 minutes.`
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
