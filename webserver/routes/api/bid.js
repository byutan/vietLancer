import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import NotificationService from '../../utils/notificationService.js';

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
router.post('/projects/:id/bid', async (req, res) => {
  const { id } = req.params;
  const { freelancer_name, freelancer_email, bid_desc, price_offer } = req.body;
  
  if (!freelancer_name || !freelancer_email || !bid_desc || !price_offer) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields.' 
    });
  }

  try {
    const projects = readProjects();
    const project = projects.find(p => p.id === id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found.' 
      });
    }

    // Check if project is approved (chỉ bid vào project đã approved)
    if (project.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Can only bid on approved projects.'
      });
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
    
    if (!Array.isArray(project.list_of_bid)) {
      project.list_of_bid = [];
    }
    
    project.list_of_bid.push(bid);
    writeProjects(projects);

    // Send submit bid noti
    try {
      await NotificationService.notifyBidSubmitted(freelancer_email, {
        bidId: bid.bid_ID,
        projectId: project.id,
        projectName: project.title || project.name,
        bidAmount: price_offer
      });
      console.log(`Notification sent to freelancer ${freelancer_email} for submitted bid`);
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
      // Không return error vì bid đã submit thành công
    }

    res.json({ 
      success: true, 
      message: 'Bid submitted successfully. You will be notified once reviewed.', 
      bid 
    });

  } catch (error) {
    console.error('Error submitting bid:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});

// POST /api/projects/:projectId/bid/:bidId/approve - Mod duyệt bid
router.post('/projects/:projectId/bid/:bidId/approve', async (req, res) => {
  const { projectId, bidId } = req.params;
  const { status } = req.body; // 'accepted' hoặc 'rejected'
  
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid status. Must be "accepted" or "rejected".' 
    });
  }

  try {
    const projects = readProjects();
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found.' 
      });
    }
    
    const bid = project.list_of_bid?.find(b => b.bid_ID === bidId);
    
    if (!bid) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bid not found.' 
      });
    }

    // Update bid status
    bid.bid_status = status;
    bid.reviewed_at = new Date().toISOString();
    
    writeProjects(projects);

    // sent bid approval noti
    try {
      if (status === 'accepted') {
        // Bid được chấp nhận
        await NotificationService.notifyBidApproved(bid.freelancer_email, {
          bidId: bid.bid_ID,
          projectId: project.id,
          projectName: project.title || project.name,
          bidAmount: bid.price_offer,
          clientEmail: project.clientEmail // Client email để freelancer liên hệ
        });
        console.log(`Notification sent to freelancer ${bid.freelancer_email} - Bid ACCEPTED`);
      } else if (status === 'rejected') {
        // Bid bị từ chối
        await NotificationService.notifyBidRejected(bid.freelancer_email, {
          bidId: bid.bid_ID,
          projectId: project.id,
          projectName: project.title || project.name
        });
        console.log(`Notification sent to freelancer ${bid.freelancer_email} - Bid REJECTED`);
      }
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
      // Không return error vì bid đã được xử lý thành công
    }

    res.json({ 
      success: true, 
      message: `Bid ${status} successfully. Freelancer has been notified.`, 
      bid 
    });

  } catch (error) {
    console.error('Error approving/rejecting bid:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});

// GET /api/projects/:id/bids - Lấy danh sách bids của 1 project
router.get('/projects/:id/bids', (req, res) => {
  try {
    const { id } = req.params;
    const projects = readProjects();
    const project = projects.find(p => p.id === id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found.' 
      });
    }

    const bids = project.list_of_bid || [];
    
    res.json({
      success: true,
      projectId: project.id,
      projectName: project.title || project.name,
      bids: bids.sort((a, b) => new Date(b.bid_date) - new Date(a.bid_date))
    });

  } catch (error) {
    console.error('Error getting bids:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});

// GET /api/freelancer/bids - Lấy tất cả bids của freelancer (theo email)
router.get('/freelancer/bids', (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Freelancer email is required.'
      });
    }

    const projects = readProjects();
    const freelancerBids = [];

    // Tìm tất cả bids của freelancer này
    projects.forEach(project => {
      if (Array.isArray(project.list_of_bid)) {
        project.list_of_bid.forEach(bid => {
          if (bid.freelancer_email === email) {
            freelancerBids.push({
              ...bid,
              projectId: project.id,
              projectName: project.title || project.name,
              projectStatus: project.status
            });
          }
        });
      }
    });

    res.json({
      success: true,
      freelancerEmail: email,
      totalBids: freelancerBids.length,
      bids: freelancerBids.sort((a, b) => new Date(b.bid_date) - new Date(a.bid_date))
    });

  } catch (error) {
    console.error('Error getting freelancer bids:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});


// -----------------------------------------------------------------
// HÀM MỚI: DÀNH CHO CLIENT "REJECT"
// React sẽ gọi API này khi Client bấm nút "Reject"
// -----------------------------------------------------------------
router.patch('/projects/:projectId/bids/:bidId', (req, res) => {
    const { projectId, bidId } = req.params;
    const { client_status } = req.body; // React gửi: { client_status: 'client_rejected' }

    if (client_status !== 'client_rejected') {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid action' 
        });
    }

    try {
        const projects = readProjects();
        const project = projects.find(p => p.id === projectId);

        if (!project) {
            return res.status(404).json({ 
                success: false, 
                message: 'Project not found' 
            });
        }

        const bid = project.list_of_bid?.find(b => b.bid_ID === bidId);
        if (!bid) {
            return res.status(404).json({ 
                success: false, 
                message: 'Bid not found' 
            });
        }

        // Thêm "biến khác" (client_status) VÀO BID
        bid.client_status = 'client_rejected';

        writeProjects(projects); // Lưu file

        // Trả về JSON
        res.status(200).json({ 
            success: true, 
            message: 'Bid rejected successfully' 
        });

    } catch (error) {
        console.error('Error rejecting bid:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});


export default router;