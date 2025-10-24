import nodemailer from 'nodemailer';

export async function sendVerificationCodeEmail(to, verificationCode) {
    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS  
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER, 
        to: to,                      
        subject: 'Verification Code',
        text: `Your verification code is: ${verificationCode}. This code will expire in 5 minutes.`
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
