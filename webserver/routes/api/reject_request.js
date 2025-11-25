import express from 'express';
import pool from '../../config/db.js';
import NotificationService from '../../utils/notificationService.js';

const router = express.Router();

// POST /api/reject - Reject project
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id, reason, rejectedBy } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Missing project id' });
    }

    await connection.beginTransaction();

    // Tìm project
    const [projects] = await connection.query(
      `SELECT 
        p.*,
        u.email as clientEmail,
        u.full_name as clientName
       FROM Project p
       LEFT JOIN Client c ON p.cID = c.client_ID
       LEFT JOIN User u ON c.client_ID = u.ID
       WHERE p.project_ID = ?`,
      [id]
    );

    if (projects.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projects[0];

    // Cập nhật project status thành Cancelled
    const rejectedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    await connection.query(
      `UPDATE Project 
       SET project_status = 'Cancelled',
           rejection_reason = ?,
           rejected_by = ?,
           rejected_at = ?
       WHERE project_ID = ?`,
      [
        reason || 'Không đáp ứng yêu cầu',
        rejectedBy || 'admin',
        rejectedAt,
        id
      ]
    );

    await connection.commit();

    // Lấy project đã cập nhật
    const [updatedProjects] = await connection.query(
      `SELECT 
        p.project_ID as id,
        p.project_name as title,
        p.project_desc as description,
        p.project_status as status,
        p.salary as budget,
        p.rejection_reason as rejectionReason,
        p.rejected_by as rejectedBy,
        p.rejected_at as rejectedAt,
        p.approved_date as updatedAt,
        u.email as clientEmail,
        u.full_name as clientName
       FROM Project p
       LEFT JOIN Client c ON p.cID = c.client_ID
       LEFT JOIN User u ON c.client_ID = u.ID
       WHERE p.project_ID = ?`,
      [id]
    );

    const updatedProject = updatedProjects[0];

    // Gửi notification cho client
    if (updatedProject.clientEmail) {
      try {
        await NotificationService.notifyProjectRejected(updatedProject.clientEmail, {
          projectId: updatedProject.id,
          projectName: updatedProject.title,
          reason: reason || 'Không đáp ứng yêu cầu',
          rejectedBy: rejectedBy || 'admin'
        });
        console.log(`Notification sent to ${updatedProject.clientEmail} for rejected project "${updatedProject.title}"`);
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }
    } else {
      console.warn('No clientEmail found in project, notification not sent');
    }

    res.json({ 
      success: true, 
      project: {
        id: updatedProject.id,
        title: updatedProject.title,
        description: updatedProject.description,
        status: updatedProject.status,
        budget: parseFloat(updatedProject.budget),
        rejectionReason: updatedProject.rejectionReason,
        rejectedBy: updatedProject.rejectedBy,
        rejectedAt: updatedProject.rejectedAt,
        updatedAt: updatedProject.updatedAt,
        clientEmail: updatedProject.clientEmail,
        clientName: updatedProject.clientName
      },
      message: 'Project rejected successfully'
    });

  } catch (err) {
    await connection.rollback();
    console.error('Error rejecting project:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  } finally {
    connection.release();
  }
});

// GET /api/reject/reasons - Lấy danh sách lý do reject phổ biến (optional)
router.get('/reasons', (req, res) => {
  const commonReasons = [
    'Không đáp ứng yêu cầu',
    'Thông tin không đầy đủ',
    'Ngân sách không hợp lý',
    'Yêu cầu không rõ ràng',
    'Vi phạm chính sách',
    'Dự án trùng lặp',
    'Khác'
  ];

  res.json({
    success: true,
    reasons: commonReasons
  });
});

// GET /api/reject/history - Lấy lịch sử các project bị reject
router.get('/history', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { clientEmail, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        p.project_ID as id,
        p.project_name as title,
        p.project_desc as description,
        p.project_status as status,
        p.salary as budget,
        p.rejection_reason as rejectionReason,
        p.rejected_by as rejectedBy,
        p.rejected_at as rejectedAt,
        u.email as clientEmail,
        u.full_name as clientName
      FROM Project p
      JOIN Client c ON p.cID = c.client_ID
      JOIN User u ON c.client_ID = u.ID
      WHERE p.project_status = 'Cancelled'
        AND p.rejection_reason IS NOT NULL
    `;

    const params = [];

    if (clientEmail) {
      query += ' AND u.email = ?';
      params.push(clientEmail);
    }

    query += ' ORDER BY p.rejected_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [projects] = await connection.query(query, params);

    const formattedProjects = projects.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      budget: parseFloat(p.budget),
      rejectionReason: p.rejectionReason,
      rejectedBy: p.rejectedBy,
      rejectedAt: p.rejectedAt,
      clientEmail: p.clientEmail,
      clientName: p.clientName
    }));

    res.json({
      success: true,
      projects: formattedProjects,
      total: formattedProjects.length
    });

  } catch (err) {
    console.error('Error getting rejection history:', err);
    res.status(500).json({
      success: false,
      error: 'Server error: ' + err.message
    });
  } finally {
    connection.release();
  }
});

export default router;