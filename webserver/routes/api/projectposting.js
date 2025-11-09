import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import NotificationService from '../../utils/notificationService.js';

const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);
const router = express.Router();

const PROJECTS_FILE = path.join(__dirName, '../../data/projects.json');

const readProjectsData = async () => {
    try {
        const data = await fs.readFile(PROJECTS_FILE, 'utf8');
        if (!data) {
            return [];
        }
        const jsonData = JSON.parse(data);
        if (Array.isArray(jsonData)) {
            return jsonData;
        }
        if (jsonData.projects && Array.isArray(jsonData.projects)) {
            return jsonData.projects;
        }
        return [];
    } catch {
        return [];
    }
};

const writeProjectsData = async (data) => {
    try {
        await fs.mkdir(path.dirname(PROJECTS_FILE), { recursive: true });
        await fs.writeFile(PROJECTS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        throw new Error('Unable to write data into file.');
    }
};

router.post('/projects', async (req, res) => {
    try {
        const {
            title,
            description,
            budget,
            category,
            skills,
            paymentMethod,
            workForm,
            clientName,
            clientEmail 
        } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in the name of the project.'
            });
        }

        if (!description) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in the description.'
            });
        }

        if (!budget) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in the predicted budget.'
            });
        }

        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Please choose a category.'
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Please choose payment method.'
            });
        }

        if (!workForm) {
            return res.status(400).json({
                success: false,
                message: 'Please choose work form.'
            });
        }

        // 🔑 Validate email
        if (!clientEmail) {
            return res.status(400).json({
                success: false,
                message: 'Client email is required.'
            });
        }

        if (title.trim().length < 5) {
            return res.status(400).json({
                success: false,
                message: 'Project name must have at least 5 letters.'
            });
        }

        if (description.trim().length < 20) {
            return res.status(400).json({
                success: false,
                message: 'Project description must have at least 20 letters.'
            });
        }

        if (budget < 1000000) {
            return res.status(400).json({
                success: false,
                message: 'Predicted budget must be at least 1.000.000'
            });
        }

        const projects = await readProjectsData(); 

        const newProject = {
            id: `project_${Date.now()}`,
            title: title.trim(),
            description: description.trim(),
            budget: parseInt(budget),
            category,
            skills: Array.isArray(skills) ? skills : [],
            paymentMethod,
            workForm,
            status: 'pending',
            clientName: clientName || 'client',
            clientEmail: clientEmail, 
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        projects.unshift(newProject);

        await writeProjectsData(projects);

        try {
            await NotificationService.notifyProjectSubmitted(clientEmail, {
                projectId: newProject.id,
                projectName: newProject.title
            });
            console.log(`Notification sent to ${clientEmail} for submitted project "${newProject.title}"`);
        } catch (notifError) {
            console.error('⚠️ Failed to send notification:', notifError);
            // Không return error vì project đã tạo thành công
        }

        res.status(201).json({
            success: true,
            message: 'Your project has been sent for approval.',
            project: newProject
        });

    } catch (error) {
        console.error('Error posting project:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
});

router.get('/projects', async (req, res) => {
    try {
        const projects = await readProjectsData();
        res.json({
            success: true,
            projects: projects 
        });
    } catch (error) {
        console.error('Error reading project:', error);
        res.status(500).json({
            success: false,
            message: 'Server error reading project'
        });
    }
});

router.get('/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const projects = await readProjectsData(); 
        const project = projects.find(p => p.id === id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project unavailable'
            });
        }

        res.json({
            success: true,
            project
        });
    } catch (error) {
        console.error('Error getting project:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});


// -----------------------------------------------------------------
// HÀM MỚI: DÀNH CHO CLIENT "ACCEPT" (HIRE)
// React sẽ gọi API này khi Client bấm nút "Accept"
// -----------------------------------------------------------------
router.patch('/projects/:projectId/hire', async (req, res) => {
    const { projectId } = req.params;
    const { hired_bid_ID } = req.body; // Lấy ID của bid được thuê từ React

    if (!hired_bid_ID) {
        return res.status(400).json({ 
            success: false, 
            message: 'Missing hired_bid_ID' 
        });
    }

    try {
        const projects = await readProjectsData();
        const projectIndex = projects.findIndex(p => p.id === projectId);

        if (projectIndex === -1) {
            return res.status(404).json({ 
                success: false, 
                message: 'Project not found' 
            });
        }

        // Cập nhật 2 "biến khác" (status và hired_bid_ID) vào project
        projects[projectIndex].status = 'in_progress';
        projects[projectIndex].hired_bid_ID = hired_bid_ID;
        projects[projectIndex].updatedAt = new Date().toISOString(); // Cập nhật thời gian

        await writeProjectsData(projects); // Lưu file JSON

        // Trả về JSON (Rất quan trọng!)
        res.status(200).json({ 
            success: true,
            message: 'Freelancer hired successfully', 
            project: projects[projectIndex] 
        });

    } catch (error) {
        console.error('Error hiring freelancer:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});


export default router;