import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import NotificationService from '../../utils/notificationService.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '../../data/projects.json');

router.post('/', async (req, res) => {
  const { id, reason, rejectedBy } = req.body;
  
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

    // Cập nhật status
    projects[idx].status = 'rejected';
    projects[idx].rejectionReason = reason || 'Không đáp ứng yêu cầu';
    projects[idx].rejectedBy = rejectedBy || 'admin';
    projects[idx].rejectedAt = new Date().toISOString();
    projects[idx].updatedAt = new Date().toISOString();

    // Ghi file
    await fs.promises.writeFile(DATA_PATH, JSON.stringify(projects, null, 2));

    // GỬI THÔNG BÁO CHO CLIENT 
    if (project.clientEmail) {
      try {
        await NotificationService.notifyProjectRejected(project.clientEmail, {
          projectId: project.id,
          projectName: project.title || project.name,
          reason: reason || 'Không đáp ứng yêu cầu',
          rejectedBy: rejectedBy || 'admin'
        });
        console.log(`Notification sent to ${project.clientEmail} for rejected project "${project.title}"`);
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }
    } else {
      console.warn('No clientEmail found in project, notification not sent');
    }

    res.json({ 
      success: true, 
      project: projects[idx],
      message: 'Project rejected successfully'
    });

  } catch (err) {
    console.error('Error rejecting project:', err);
    
    if (err.code === 'ENOENT') {
      return res.status(500).json({ error: 'Projects file not found' });
    }
    
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

export default router;