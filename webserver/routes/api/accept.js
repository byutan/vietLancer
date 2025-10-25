import express from 'express';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
const router = express.Router();
const PROJECTS_PATH = path.join(process.cwd(), 'webserver', 'data', 'projects.json');

// Accept project and update its updatedAt field to current time (from worldtimeapi.org, UTC+7)
router.post('/', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ success: false, message: 'Missing project id' });

  let projects = [];
  try {
    projects = JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8'));
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Cannot read projects.json' });
  }

  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Project not found' });

  // Fetch UTC time from postman-echo.com/time/now, store as UTC
  let updatedAt;
  try {
    const response = await fetch('https://postman-echo.com/time/now');
    const data = await response.json();
    updatedAt = new Date(data.iso).toISOString();
  } catch (e) {
    updatedAt = new Date().toISOString();
  }
  projects[idx].updatedAt = updatedAt;

  try {
    fs.writeFileSync(PROJECTS_PATH, JSON.stringify(projects, null, 2), 'utf8');
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Cannot write projects.json' });
  }

  res.json({ success: true, updatedAt });
});

// GET /api/projects - return all projects
router.get('/projects', (req, res) => {
  try {
    const projects = JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8'));
    res.json({ success: true, projects });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Cannot read projects.json' });
  }
});

export default router;
