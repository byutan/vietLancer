
import express from 'express';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '../../data/projects.json');

// Approve project and update its updatedAt field to current time (UTC+7)
router.post('/', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing project id' });

  let projects = [];
  try {
    projects = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  } catch (e) {
    return res.status(500).json({ error: 'Read error' });
  }

  const idx = projects.findIndex(p => p.id === id || p.ProjectID === id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found' });

  // Fetch UTC time from postman-echo.com/time/now, store as UTC
  let updatedAt;
  try {
    const response = await fetch('https://postman-echo.com/time/now');
    const data = await response.json();
    updatedAt = new Date(data.iso).toISOString();
  } catch (e) {
    updatedAt = new Date().toISOString();
  }

  projects[idx].status = 'approved';
  projects[idx].updatedAt = updatedAt;

  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(projects, null, 2), 'utf8');
  } catch (e) {
    return res.status(500).json({ error: 'Write error' });
  }

  res.json({ success: true, project: projects[idx] });
});

export default router;
