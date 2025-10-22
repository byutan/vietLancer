import express from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/signup', (req, res) => {
    try {
        const usersFile = process.env.USERS_FILE;
        const { name, email, password, role } = req.body;
        let users = [];
        if (fs.existsSync(usersFile)) {
            const data = fs.readFileSync(usersFile, 'utf-8');
            if (data) {
                users = JSON.parse(data);
            }
        }
        const exists = users.find(u => u.email === email);
        if (exists) {
            return res.status(400).json({ error: 'Email has already been registered.' });
        }
        users.push({ name, email, password, role });
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), { encoding: 'utf8' });
        const payload = {
            email: email,
            role: role,
            name: name
        };
        const secretKey = process.env.JWT_SECRET;
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        return res.status(201).json({ 
            message: 'Successfully registered.',
            token: token 
        });
    } catch {
        return res.status(500).json({ error: 'Failed to connect to the server.' });
    }
})

export default router;