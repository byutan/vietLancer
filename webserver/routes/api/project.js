import express from 'express';
import pool from '../../config/db.js'; // Import kết nối DB
import NotificationService from '../../utils/notificationService.js';

const router = express.Router();

// -----------------------------------------------------------------
// 1. POST /projects - Tạo dự án mới
// -----------------------------------------------------------------
router.post('/projects', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const {
            title, description, budget, category, skills, paymentMethod, 
            workForm, clientEmail, bidEndDate
        } = req.body;

        // --- VALIDATION ---
        if (!title || !description || !budget || !paymentMethod || !workForm || !clientEmail) {
            return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
        }
        if (title.trim().length < 5) return res.status(400).json({ success: false, message: 'Title too short.' });
        if (description.trim().length < 20) return res.status(400).json({ success: false, message: 'Description too short.' });
        if (budget < 1000000) return res.status(400).json({ success: false, message: 'Budget must be >= 1.000.000' });

        // --- TRANSACTION ---
        await connection.beginTransaction();

        // 1. Tìm Client ID
        const [users] = await connection.query("SELECT c.client_ID FROM User u JOIN Client c ON u.ID = c.client_ID WHERE u.email = ?", [clientEmail]);
        if (users.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Client not found.' });
        }
        const clientID = users[0].client_ID;

        // 2. Insert Project
        const [projectResult] = await connection.query(
            `INSERT INTO Project 
            (project_name, project_desc, salary, pay_method, work_form, cID, project_status, approved_date, bid_end_date, category) 
            VALUES (?, ?, ?, ?, ?, ?, 'Pending', NULL, ?, ?)`,
            [title, description, budget, paymentMethod, workForm, clientID, bidEndDate || null, category || null]
        );
        const newProjectId = projectResult.insertId;

        // 3. Skills
        if (Array.isArray(skills) && skills.length > 0) {
            for (const skillName of skills) {
                let [skillRows] = await connection.query("SELECT skill_ID FROM Skill WHERE skill_name = ?", [skillName]);
                let skillId = skillRows.length > 0 ? skillRows[0].skill_ID : (await connection.query("INSERT INTO Skill (skill_name) VALUES (?)", [skillName]))[0].insertId;
                await connection.query("INSERT INTO Requires (project_id, skill_id) VALUES (?, ?)", [newProjectId, skillId]);
            }
        }

        await connection.commit();

        // 4. Notify
        try {
            await NotificationService.notifyProjectSubmitted(clientEmail, { projectId: newProjectId, projectName: title });
        } catch (e) { console.error(e); }

        res.status(201).json({ success: true, message: 'Project posted.' });

    } catch (error) {
        await connection.rollback();
        console.error('Error posting project:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    } finally {
        connection.release();
    }
});

// -----------------------------------------------------------------
// 2. GET /projects - Lấy danh sách dự án (Public)
// -----------------------------------------------------------------
router.get('/projects', async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT p.project_ID as id, p.project_name as title, p.project_desc as description, p.salary as budget, p.project_status as status,
            p.pay_method as paymentMethod, p.work_form as workForm, p.category, p.bid_end_date as deadline, p.created_at as createdAt,
            u.full_name as clientName, u.email as clientEmail, GROUP_CONCAT(s.skill_name) as skills
            FROM Project p
            JOIN Client c ON p.cID = c.client_ID JOIN User u ON c.client_ID = u.ID
            LEFT JOIN Requires r ON p.project_ID = r.project_id LEFT JOIN Skill s ON r.skill_id = s.skill_ID
        `;
        const params = [];
        if (status) { query += " WHERE p.project_status = ?"; params.push(status); }
        query += " GROUP BY p.project_ID ORDER BY p.created_at DESC";

        const [rows] = await pool.query(query, params);
        
        // Map skills và bids
        for (let project of rows) {
            project.skills = project.skills ? project.skills.split(',') : [];
            // Lấy bids để frontend tính count
            const [bids] = await pool.query("SELECT bid_id FROM Bid WHERE project_ID = ?", [project.id]);
            project.list_of_bid = bids;
        }

        res.json({ success: true, projects: rows });
    } catch (error) {
        console.error('Error reading projects:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// -----------------------------------------------------------------
// 3. GET /projects/:id - Chi tiết 1 dự án
// -----------------------------------------------------------------
router.get('/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT p.project_ID as id, p.project_name as title, p.project_desc as description, p.salary as budget, p.project_status as status,
            p.pay_method as paymentMethod, p.work_form as workForm, p.category, p.bid_end_date as deadline, p.created_at as createdAt,
            u.full_name as clientName, u.email as clientEmail, GROUP_CONCAT(s.skill_name) as skills
            FROM Project p
            JOIN Client c ON p.cID = c.client_ID JOIN User u ON c.client_ID = u.ID
            LEFT JOIN Requires r ON p.project_ID = r.project_id LEFT JOIN Skill s ON r.skill_id = s.skill_ID
            WHERE p.project_ID = ? GROUP BY p.project_ID
        `;
        const [rows] = await pool.query(query, [id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Project unavailable' });
        
        const project = rows[0];
        project.skills = project.skills ? project.skills.split(',') : [];
        
        // Lấy list bids
        const [bids] = await pool.query("SELECT * FROM Bid WHERE project_ID = ?", [id]);
        project.list_of_bid = bids;

        res.json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// -----------------------------------------------------------------
// 4. GET /projects/client/:email - Lấy dự án CỦA CLIENT (Kèm Bids & Hired Info)
// -----------------------------------------------------------------
router.get('/projects/client/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // 1. Lấy Projects
        const projectQuery = `
            SELECT p.project_ID as id, p.project_name as title, p.project_desc as description, 
                   p.salary as budget, p.project_status as status, p.created_at
            FROM Project p
            JOIN Client c ON p.cID = c.client_ID JOIN User u ON c.client_ID = u.ID
            WHERE u.email = ?
            ORDER BY p.created_at DESC
        `;
        const [projects] = await pool.query(projectQuery, [email]);

        // 2. Lấy Bids cho từng Project
        for (let project of projects) {
            const bidQuery = `
                SELECT 
                    b.bid_id as bid_ID, b.bid_desc, b.price_offer, b.bid_status, b.bid_date,
                    u.full_name as freelancer_name, u.email as freelancer_email
                FROM Bid b
                JOIN User u ON b.fID = u.ID
                WHERE b.project_ID = ?
            `;
            const [bids] = await pool.query(bidQuery, [project.id]);
            
            project.list_of_bid = bids; 
            
            // Tìm hired bid (accepted)
            const hiredBid = bids.find(b => b.bid_status && b.bid_status.toLowerCase() === 'in progress');
            if (hiredBid) {
                project.hired_bid_ID = hiredBid.bid_ID;
            }
        }

        res.json({ success: true, projects });
    } catch (error) {
        console.error('Error fetching client projects:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// -----------------------------------------------------------------
// 5. PATCH /projects/:projectId/hire - Thuê Freelancer
// -----------------------------------------------------------------
router.patch('/projects/:projectId/hire', async (req, res) => {
    const { projectId } = req.params;
    const { hired_bid_ID } = req.body;
    const connection = await pool.getConnection();

    if (!hired_bid_ID) return res.status(400).json({ success: false, message: 'Missing hired_bid_ID' });

    try {
        await connection.beginTransaction();

        // Get info for notification
        const [bids] = await connection.query(
            `SELECT b.*, u.email as freelancer_email, p.project_name, client_u.email as client_email
             FROM Bid b JOIN User u ON b.fID = u.ID JOIN Project p ON b.project_ID = p.project_ID
             JOIN Client c ON p.cID = c.client_ID JOIN User client_u ON c.client_ID = client_u.ID
             WHERE b.bid_id = ?`, [hired_bid_ID]
        );
        if (bids.length === 0) { await connection.rollback(); return res.status(404).json({ success: false, message: 'Bid not found' }); }
        const hiredBid = bids[0];

        // 1. Update Bid được chọn -> Accepted
        await connection.query("UPDATE Bid SET bid_status = 'Accepted' WHERE bid_id = ?", [hired_bid_ID]);
        
        // 2. 🔥 CẬP NHẬT QUAN TRỌNG: Từ chối tất cả các Bid khác trong cùng Project
        await connection.query(
            "UPDATE Bid SET bid_status = 'Rejected' WHERE project_ID = ? AND bid_id != ?", 
            [projectId, hired_bid_ID]
        );

        // 3. Update Project -> In Progress
        await connection.query("UPDATE Project SET project_status = 'In Progress' WHERE project_ID = ?", [projectId]);

        await connection.commit();

        // Gửi thông báo cho người được nhận
        try {
            await NotificationService.notifyBidApproved(hiredBid.freelancer_email, {
                bidId: hiredBid.bid_id, projectId, projectName: hiredBid.project_name,
                bidAmount: hiredBid.price_offer, clientEmail: hiredBid.client_email
            });
        } catch (e) { console.error(e); }

        res.status(200).json({ success: true, message: 'Hired successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Error hiring:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        connection.release();
    }
});

// -----------------------------------------------------------------
// 6. PATCH /projects/:id/bids/:bidId - Từ chối Bid
// -----------------------------------------------------------------
router.patch('/projects/:projectId/bids/:bidId', async (req, res) => {
    const { projectId, bidId } = req.params;
    const connection = await pool.getConnection();

    try {
        const [bids] = await connection.query(
            `SELECT b.*, u.email as freelancer_email, p.project_name 
             FROM Bid b JOIN User u ON b.fID = u.ID JOIN Project p ON b.project_ID = p.project_ID
             WHERE b.bid_id = ?`, [bidId]
        );
        if (bids.length === 0) return res.status(404).json({ success: false, message: 'Bid not found' });
        const targetBid = bids[0];

        await connection.query("UPDATE Bid SET bid_status = 'Rejected' WHERE bid_id = ?", [bidId]);

        try {
            await NotificationService.notifyBidRejected(targetBid.freelancer_email, {
                bidId, projectId, projectName: targetBid.project_name
            });
        } catch (e) { console.error(e); }

        res.status(200).json({ success: true, message: 'Bid rejected' });
    } catch (error) {
        console.error('Error rejecting:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        connection.release();
    }
});

// -----------------------------------------------------------------
// 7. PATCH /projects/:id/complete - Hoàn thành dự án
// -----------------------------------------------------------------
router.patch('/projects/:id/complete', async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
        const [projects] = await connection.query("SELECT project_status FROM Project WHERE project_ID = ?", [id]);
        if (projects.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });
        
        if (projects[0].project_status !== 'In Progress') {
             return res.status(400).json({ success: false, message: 'Project must be In Progress to complete.' });
        }

        await connection.query("UPDATE Project SET project_status = 'Completed' WHERE project_ID = ?", [id]);
        res.json({ success: true, message: 'Project completed.' });

    } catch (error) {
        console.error('Error completing project:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        connection.release();
    }
});

export default router;