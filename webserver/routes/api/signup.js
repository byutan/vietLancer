import express from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/signup', (req, res) => {
    try {
        const usersFile = process.env.USERS_FILE;
        const { name, email, password, role } = req.body;
        console.log("Incoming update:", req.body);
        console.log("Token:", req.headers['authorization']);
        console.log("User file path:", process.env.USERS_FILE);
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
        const newUser = {
            name,
            email,
            password,
            role,
            phone: '',
            address: '',
            dob: '',
            avatar: '',
            email_verify: 'unverified',
            skills: {
                languages: [],
                education: [],
                experience: []
            }
        };
        users.push( newUser );
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), { encoding: 'utf8' });
        const payload = {
            email: newUser.email,
            role: newUser.role,
            name: newUser.name,
            email_verify: newUser.email_verify,
            phone: newUser.phone,
            address: newUser.address,
            dob: newUser.dob,
            avatar: newUser.avatar,
            skills: newUser.skills
        };
        const secretKey = process.env.JWT_SECRET;
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        return res.status(201).json({ 
            message: 'Successfully registered.',
            token: token,
            user: newUser
        });
    } catch {
        return res.status(500).json({ error: 'Failed to connect to the server.' });
    }
})

export default router;