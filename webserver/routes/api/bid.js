import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const projectsPath = path.join(process.cwd(), 'data', 'projects.json');

// Helper: read/write projects
function readProjects() {
  return JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
}
function writeProjects(projects) {
  fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2));
}

// POST /api/projects/:id/bid - Freelancer gửi bid
router.post('/projects/:id/bid', (req, res) => {
  const { id } = req.params;
  const { freelancer_name, freelancer_email, bid_desc, price_offer } = req.body;
  if (!freelancer_name || !freelancer_email || !bid_desc || !price_offer) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }
  const projects = readProjects();
  const project = projects.find(p => p.id === id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }
  const bid = {
    bid_ID: uuidv4(),
    freelancer_name,
    freelancer_email,
    bid_desc,
    price_offer: Number(price_offer),
    bid_status: 'pending',
    bid_date: new Date().toISOString()
  };
  if (!Array.isArray(project.list_of_bid)) project.list_of_bid = [];
  project.list_of_bid.push(bid);
  writeProjects(projects);
  res.json({ success: true, message: 'Bid submitted successfully.', bid });
});

// POST /api/projects/:projectId/bid/:bidId/approve - Mod duyệt bid
router.post('/projects/:projectId/bid/:bidId/approve', (req, res) => {
  const { projectId, bidId } = req.params;
  const { status } = req.body; // 'accepted' hoặc 'rejected'
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }
  const projects = readProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }
  const bid = project.list_of_bid.find(b => b.bid_ID === bidId);
  if (!bid) {
    return res.status(404).json({ success: false, message: 'Bid not found.' });
  }
  bid.bid_status = status;
  writeProjects(projects);
  res.json({ success: true, message: 'Bid status updated.', bid });
});

export default router;
