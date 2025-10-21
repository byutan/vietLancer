import express from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken'; 

const router = express.Router();

router.post('/signin', (req, res) => {
    try {
        const usersFile = process.env.USERS_FILE;
        const { email, password } = req.body;
        let users = [];
        if (fs.existsSync(usersFile)) {
            const data = fs.readFileSync(usersFile, 'utf-8');
            if (data) {
                users = JSON.parse(data);
            }
        }
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            const payload = {
                email: user.email,
                role: user.role,
                name: user.name
            };
            const secretKey = process.env.JWT_SECRET;
            const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
            return res.status(200).json({
                message: 'Successfully signed in.',
                token: token
            });

        } else {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
    } catch {
        return res.status(500).json({ error: 'Failed to connect to the server.' });
    }
});

export default router;