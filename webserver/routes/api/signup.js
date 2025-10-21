import express from 'express';
import fs from 'fs';

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
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
        res.status(200).json({
            message: 'Successfully registered.',
            role: role,
            name: name
        });
    } catch {
        return res.status(500).json({ error: 'Failed to connect to the server.' });
    }
})

export default router;