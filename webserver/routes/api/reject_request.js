import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '../../data/projects.json');

router.post('/', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing project id' });

  fs.readFile(DATA_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Read error' });
    let projects = JSON.parse(data);
    const idx = projects.findIndex(p => p.id === id || p.ProjectID === id);
    if (idx === -1) return res.status(404).json({ error: 'Project not found' });
    projects[idx].status = 'rejected';
    fs.writeFile(DATA_PATH, JSON.stringify(projects, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Write error' });
      res.json({ success: true, project: projects[idx] });
    });
  });
});

export default router;
