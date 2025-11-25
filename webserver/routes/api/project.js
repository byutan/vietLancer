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
            title,
            description,
            budget,
            category,
            skills,
            paymentMethod,
            workForm,
            clientEmail,
            bidEndDate // Nhận thêm ngày kết thúc thầu
        } = req.body;

        // --- VALIDATION ---
        if (!title || !description || !budget || !paymentMethod || !workForm || !clientEmail) {
            return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
        }
        if (title.trim().length < 5) return res.status(400).json({ success: false, message: 'Project name must have at least 5 letters.' });
        if (description.trim().length < 20) return res.status(400).json({ success: false, message: 'Description must have at least 20 letters.' });
        if (budget < 1000000) return res.status(400).json({ success: false, message: 'Budget must be at least 1.000.000' });

        // --- BẮT ĐẦU TRANSACTION ---
        await connection.beginTransaction();

        // 1. Tìm Client ID dựa trên Email
        const [users] = await connection.query(
            `SELECT c.client_ID, u.full_name 
             FROM User u 
             JOIN Client c ON u.ID = c.client_ID 
             WHERE u.email = ?`, 
            [clientEmail]
        );

        if (users.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Client account not found.' });
        }
        const clientID = users[0].client_ID;
        const clientName = users[0].full_name;

        // 2. Insert vào bảng Project
        const [projectResult] = await connection.query(
            `INSERT INTO Project 
            (project_name, project_desc, salary, pay_method, work_form, cID, project_status, approved_date, bid_end_date, category) 
            VALUES (?, ?, ?, ?, ?, ?, 'Pending', NULL, ?, ?)`,
            [title, description, budget, paymentMethod, workForm, clientID, bidEndDate || null, category || null]
        );

        const newProjectId = projectResult.insertId;

        // 3. Xử lý Skills (Bảng Requires)
        if (Array.isArray(skills) && skills.length > 0) {
            for (const skillName of skills) {
                // Kiểm tra skill có trong bảng Skill chưa
                let [skillRows] = await connection.query("SELECT skill_ID FROM Skill WHERE skill_name = ?", [skillName]);
                
                let skillId;
                if (skillRows.length === 0) {
                    // Nếu chưa có, tạo skill mới
                    const [newSkill] = await connection.query("INSERT INTO Skill (skill_name) VALUES (?)", [skillName]);
                    skillId = newSkill.insertId;
                } else {
                    skillId = skillRows[0].skill_ID;
                }

                // Insert vào bảng trung gian Requires
                await connection.query("INSERT INTO Requires (project_id, skill_id) VALUES (?, ?)", [newProjectId, skillId]);
            }
        }

        // --- COMMIT TRANSACTION ---
        await connection.commit();

        // 4. Gửi thông báo
        try {
            await NotificationService.notifyProjectSubmitted(clientEmail, {
                projectId: newProjectId,
                projectName: title
            });
            console.log(`Notification sent to ${clientEmail}`);
        } catch (notifError) {
            console.error('⚠️ Failed to send notification:', notifError);
        }

        res.status(201).json({
            success: true,
            message: 'Your project has been sent for approval.',
            project: {
                id: newProjectId,
                title,
                status: 'Pending',
                clientName
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error posting project:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    } finally {
        connection.release();
    }
});

// -----------------------------------------------------------------
// 2. GET /projects - Lấy danh sách dự án (Public & Filter)
// -----------------------------------------------------------------
router.get('/projects', async (req, res) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT 
                p.project_ID as id,
                p.project_name as title,
                p.project_desc as description,
                p.salary as budget,
                p.project_status as status,
                p.pay_method as paymentMethod,
                p.work_form as workForm,
                p.category,
                p.bid_end_date as deadline,
                p.created_at as createdAt,
                p.updated_at as updatedAt,
                u.full_name as clientName,
                u.email as clientEmail,
                GROUP_CONCAT(s.skill_name) as skills
            FROM Project p
            JOIN Client c ON p.cID = c.client_ID
            JOIN User u ON c.client_ID = u.ID
            LEFT JOIN Requires r ON p.project_ID = r.project_id
            LEFT JOIN Skill s ON r.skill_id = s.skill_ID
        `;

        const params = [];
        if (status) {
            query += " WHERE p.project_status = ?";
            params.push(status);
        }

        query += " GROUP BY p.project_ID ORDER BY p.created_at DESC";

        const [rows] = await pool.query(query, params);

        const projects = rows.map(row => ({
            ...row,
            skills: row.skills ? row.skills.split(',') : []
        }));

        res.json({ success: true, projects });

    } catch (error) {
        console.error('Error reading projects:', error);
        res.status(500).json({ success: false, message: 'Server error reading projects' });
    }
});

// -----------------------------------------------------------------
// 3. GET /projects/:id - Lấy chi tiết 1 dự án
// -----------------------------------------------------------------
router.get('/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;

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
                p.bid_end_date as deadline,
                p.created_at as createdAt,
                u.full_name as clientName,
                u.email as clientEmail,
                GROUP_CONCAT(s.skill_name) as skills
            FROM Project p
            JOIN Client c ON p.cID = c.client_ID
            JOIN User u ON c.client_ID = u.ID
            LEFT JOIN Requires r ON p.project_ID = r.project_id
            LEFT JOIN Skill s ON r.skill_id = s.skill_ID
            WHERE p.project_ID = ?
            GROUP BY p.project_ID
        `;

        const [rows] = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Project unavailable' });
        }

        const project = rows[0];
        project.skills = project.skills ? project.skills.split(',') : [];

        res.json({ success: true, project });

    } catch (error) {
        console.error('Error getting project:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// -----------------------------------------------------------------
// 4. GET /projects/client/:email - Lấy dự án CỦA MỘT CLIENT (Kèm Bids)
// 👉 Dùng cho trang MyProjectPage.js
// -----------------------------------------------------------------
router.get('/projects/client/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // 1. Tìm thông tin dự án của Client này
        const projectQuery = `
            SELECT 
                p.project_ID as id,
                p.project_name as title,
                p.project_desc as description,
                p.salary as budget,
                p.project_status as status,
                p.created_at
            FROM Project p
            JOIN Client c ON p.cID = c.client_ID
            JOIN User u ON c.client_ID = u.ID
            WHERE u.email = ?
            ORDER BY p.created_at DESC
        `;
        const [projects] = await pool.query(projectQuery, [email]);

        // 2. Lấy danh sách Bid cho từng dự án
        // (Để Frontend MyProjectPage hiển thị danh sách người thầu)
        for (let project of projects) {
            const bidQuery = `
                SELECT 
                    b.bid_id as bid_ID,
                    b.bid_desc,
                    b.price_offer,
                    b.bid_status,
                    b.bid_date,
                    u.full_name as freelancer_name,
                    u.email as freelancer_email
                FROM Bid b
                JOIN User u ON b.fID = u.ID
                WHERE b.project_ID = ?
            `;
            const [bids] = await pool.query(bidQuery, [project.id]);
            
            project.list_of_bid = bids; 
            
            // Tìm xem dự án đã thuê ai chưa (Accepted)
            const hiredBid = bids.find(b => b.bid_status === 'Accepted');
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
// 5. PATCH /projects/:projectId/hire - Thuê Freelancer (Accept Bid)
// -----------------------------------------------------------------
router.patch('/projects/:projectId/hire', async (req, res) => {
    const { projectId } = req.params;
    const { hired_bid_ID } = req.body;
    const connection = await pool.getConnection();

    if (!hired_bid_ID) {
        return res.status(400).json({ success: false, message: 'Missing hired_bid_ID' });
    }

    try {
        await connection.beginTransaction();

        // 1. Update Bid được chọn -> Accepted
        await connection.query(
            "UPDATE Bid SET bid_status = 'Accepted' WHERE bid_id = ?", 
            [hired_bid_ID]
        );

        // 2. Update Project -> In Progress
        await connection.query(
            "UPDATE Project SET project_status = 'In Progress' WHERE project_ID = ?", 
            [projectId]
        );

        // 3. (Optional) Update các Bid còn lại -> Rejected
        // await connection.query(
        //    "UPDATE Bid SET bid_status = 'Rejected' WHERE project_ID = ? AND bid_id != ?", 
        //    [projectId, hired_bid_ID]
        // );

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Freelancer hired successfully',
            project: { id: projectId, status: 'In Progress', hired_bid_ID }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error hiring freelancer:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    } finally {
        connection.release();
    }
});

export default router;