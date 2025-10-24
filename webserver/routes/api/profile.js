import express from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.put('/profile', (req, res) => {
    try {
        const usersFile = process.env.USERS_FILE;
        const secretKey = process.env.JWT_SECRET;
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided.' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, secretKey);
        } catch {
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        const { personalInfo, skills } = req.body;

        if (!personalInfo || !skills) {
            return res.status(400).json({ error: 'Missing personalInfo or skills in request body.' });
        }

        let users = [];
        if (fs.existsSync(usersFile)) {
            const data = fs.readFileSync(usersFile, 'utf-8');
            users = data ? JSON.parse(data) : [];
        }

        const index = users.findIndex(u => u.email === decoded.email);
        if (index === -1) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const mergedSkills = {
            languages: skills?.languages || users[index].skills?.languages || [],
            education: skills?.education || users[index].skills?.education || [],
            experience: skills?.experience || users[index].skills?.experience || [],
        };

        const updatedUser = {
            ...users[index],
            name: personalInfo?.fullname || users[index].name,
            email: personalInfo?.email || users[index].email,
            password: personalInfo?.password || users[index].password,
            phone: personalInfo?.phone || users[index].phone,
            address: personalInfo?.address || users[index].address,
            dob: personalInfo?.dob || users[index].dob,
            email_verify: personalInfo?.email_verify || users[index].email_verify,
            avatar: personalInfo?.avatar || users[index].avatar,
            skills: mergedSkills,
        };

        users[index] = updatedUser;
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

        const newToken = jwt.sign(
            {
                email: updatedUser.email,
                name: updatedUser.name,
                phone: updatedUser.phone,
                address: updatedUser.address,
                email_verify: updatedUser.email_verify,
                dob: updatedUser.dob,
                avatar: updatedUser.avatar,
                skills: updatedUser.skills,
            },
            secretKey,
            { expiresIn: '1h' }
        );
        return res.status(200).json({
            message: 'Profile updated successfully.',
            user: updatedUser,
            token: newToken,
        });
    } catch {
        return res.status(500).json({ error: 'Failed to update profile.' });
    }
});


export default router;
