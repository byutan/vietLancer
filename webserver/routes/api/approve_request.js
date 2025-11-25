import express from 'express';
import pool from '../../config/db.js'; // Import kết nối DB
import NotificationService from '../../utils/notificationService.js';

const router = express.Router();

// ============================================================
// 1. POST /api/approve - Duyệt dự án
// ============================================================
router.post('/', async (req, res) => {
    const { id, approvedBy } = req.body; // approvedBy nên là Admin ID (số)

    if (!id) {
        return res.status(400).json({ error: 'Missing project id' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Tìm Project và lấy Email của Client (để gửi thông báo)
        const queryInfo = `
            SELECT 
                p.project_ID, 
                p.project_name, 
                p.cID,
                u.email as clientEmail,
                u.full_name as clientName
            FROM Project p
            JOIN Client c ON p.cID = c.client_ID
            JOIN User u ON c.client_ID = u.ID
            WHERE p.project_ID = ?
        `;

        const [rows] = await connection.query(queryInfo, [id]);

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Project not found' });
        }

        const project = rows[0];

        // 2. Cập nhật trạng thái Project
        // - status: chuyển thành 'Open' (để Freelancer bắt đầu thấy và Bid)
        // - approved_date: lấy thời gian hiện tại
        // - admin_ID: người duyệt (approvedBy)
        
        // Kiểm tra xem approvedBy có phải là số (ID) không, nếu không thì để NULL
        const adminId = isNaN(approvedBy) ? null : approvedBy;

        const updateQuery = `
            UPDATE Project 
            SET 
            project_status = 'Open', 
            approved_date = NOW(), 
            bid_end_date = DATE_ADD(NOW(), INTERVAL 7 DAY),
            admin_ID = ? 
            WHERE project_ID = ?
        `;

        await connection.query(updateQuery, [adminId, id]);

        await connection.commit();

        // 3. Gửi thông báo cho Client
        if (project.clientEmail) {
            try {
                await NotificationService.notifyProjectApproved(project.clientEmail, {
                    projectId: project.project_ID,
                    projectName: project.project_name,
                    approvedBy: approvedBy || 'Admin'
                });
                console.log(`Notification sent to ${project.clientEmail} for project "${project.project_name}"`);
            } catch (notifError) {
                console.error('Failed to send notification:', notifError);
            }
        }

        // 4. Trả về kết quả
        res.json({
            success: true,
            message: 'Project approved successfully',
            project: {
                id: project.project_ID,
                title: project.project_name,
                status: 'Open',
                approvedBy: adminId,
                approvedAt: new Date(),
                clientEmail: project.clientEmail
            }
        });

    } catch (err) {
        await connection.rollback();
        console.error('Error approving project:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    } finally {
        connection.release();
    }
});

// ============================================================
// 2. GET /api/approve/projects - Lấy tất cả project (thường dùng cho Admin dashboard)
// ============================================================
// GET /projects
router.get('/projects', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.project_ID as id,
                p.project_name as title,
                p.project_desc as description,
                p.salary as budget,
                p.project_status as status,
                p.pay_method as paymentMethod,
                p.work_form as workForm,
                p.category,
                
                p.created_at as createdAt,
                p.updated_at as updatedAt,
                p.approved_date,
                
                u.full_name as clientName,
                u.email as clientEmail,
                GROUP_CONCAT(s.skill_name) as skills
            FROM Project p
            JOIN Client c ON p.cID = c.client_ID
            JOIN User u ON c.client_ID = u.ID
            LEFT JOIN Requires r ON p.project_ID = r.project_id
            LEFT JOIN Skill s ON r.skill_id = s.skill_ID
            GROUP BY p.project_ID
            ORDER BY p.created_at DESC
        `;

        const [projects] = await pool.query(query);

        res.json({ success: true, projects });

    } catch (e) {
        console.error("Error reading projects:", e);
        res.status(500).json({ success: false, message: 'Cannot read projects from database' });
    }
});

export default router;