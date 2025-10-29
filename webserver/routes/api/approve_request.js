import express from 'express';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import NotificationService from '../../utils/notificationService.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '../../data/projects.json');

// Approve project and update its updatedAt field to current time (UTC)
router.post('/', async (req, res) => {
  const { id, approvedBy } = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'Missing project id' });
  }

  try {
    // Đọc file
    const data = await fs.promises.readFile(DATA_PATH, 'utf8');
    let projects = JSON.parse(data);

    // Tìm project
    const idx = projects.findIndex(p => p.id === id || p.ProjectID === id);
    
    if (idx === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projects[idx];

    // Fetch UTC time from postman-echo.com/time/now, store as UTC
    let updatedAt;
    try {
      const response = await fetch('https://postman-echo.com/time/now');
      const data = await response.json();
      updatedAt = new Date(data.iso).toISOString();
    } catch (e) {
      updatedAt = new Date().toISOString();
    }

    // Cập nhật project
    projects[idx].status = 'approved';
    projects[idx].approvedBy = approvedBy || 'admin';
    projects[idx].approvedAt = updatedAt;
    projects[idx].updatedAt = updatedAt;

    // Ghi file
    await fs.promises.writeFile(DATA_PATH, JSON.stringify(projects, null, 2));

    // 🔔 GỬI THÔNG BÁO CHO CLIENT (dùng email)
    if (project.clientEmail) {
      try {
        await NotificationService.notifyProjectApproved(project.clientEmail, {
          projectId: project.id,
          projectName: project.title || project.name,
          approvedBy: approvedBy || 'admin'
        });
        console.log(`✅ Notification sent to ${project.clientEmail} for approved project "${project.title}"`);
      } catch (notifError) {
        console.error('⚠️ Failed to send notification:', notifError);
      }
    } else {
      console.warn('⚠️ No clientEmail found in project, notification not sent');
    }

    res.json({ 
      success: true, 
      project: projects[idx],
      message: 'Project approved successfully'
    });

  } catch (err) {
    console.error('Error approving project:', err);
    
    if (err.code === 'ENOENT') {
      return res.status(500).json({ error: 'Projects file not found' });
    }
    
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// GET /api/projects - return all projects (moved from accept.js)
router.get('/projects', async (req, res) => {
  try {
    const data = await fs.promises.readFile(DATA_PATH, 'utf8');
    const projects = JSON.parse(data);
    res.json({ success: true, projects });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Cannot read projects.json' });
  }
});

export default router;