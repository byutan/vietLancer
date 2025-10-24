import express from 'express';
import fs from 'fs';
import { sendVerificationCodeEmail } from '../../utils/mailer.js';

const router = express.Router();

router.post('/send-verification-code', async (req, res) => {
    try {
        const usersFile = process.env.USERS_FILE;
        const { target } = req.body;
        const userEmail = target;
        if (!userEmail) { 
            return res.status(400).json({ error: 'Email is required.' });
        }
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const codeExpires = Date.now() + 5 * 60 * 1000; 
        let users = [];
        if (fs.existsSync(usersFile)) {
            const data = fs.readFileSync(usersFile, 'utf-8');
            if (data) {
                users = JSON.parse(data);
            }
        }
        const userIndex = users.findIndex(u => u.email && u.email.trim() === userEmail.trim());
        if (userIndex === -1) {
            return res.status(404).json({ error: `No user found with email ${userEmail}` });
        }
        users[userIndex].verificationCode = verificationCode;
        users[userIndex].verificationCodeExpires = codeExpires;
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), { encoding: 'utf8' });
        try {
            const emailSent = await sendVerificationCodeEmail(userEmail, verificationCode);
            if (!emailSent) {
                throw new Error('Failed to send verification code email.');
            }
            return res.status(200).json({ message: 'Verification code has been sent to your email address.' });
        } catch {
            return res.status(500).json({ error: 'Failed to send verification code email.' });
        }

    } catch {
        return res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
});

router.post('/confirm-verification-code', async (req, res) => {
    try {
        const { email, code } = req.body;
        const usersFile = process.env.USERS_FILE;
        let users = [];
        if (fs.existsSync(usersFile)) {
            const data = fs.readFileSync(usersFile, 'utf-8');
            if (data) {
                users = JSON.parse(data);
            }
        }
        
        const userIndex = users.findIndex(u => u.email && u.email.trim() === email.trim());
        if (userIndex === -1) {
            return res.status(404).json({ error: `No user found with email ${email}` });
        }
        
        const user = users[userIndex];
        const currentTime = Date.now();

        if (currentTime > user.verificationCodeExpires) {
            return res.status(400).json({ error: 'Verification code has expired.' });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({ error: 'Incorrect verification code.' });
        }
        user.email_verify = 'verified';  
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), { encoding: 'utf8' });
        return res.status(200).json({ message: 'Verification successful!', user: user });

    } catch (err) {
        return res.status(500).json({ error: 'An unexpected error occurred while verifying the code.' });
    }
});

export default router;