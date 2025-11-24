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
            category, // Lưu ý: Trong DB cũ không có cột category, mình sẽ tạm bỏ qua hoặc bạn cần thêm cột này vào DB
            skills,
            paymentMethod,
            workForm,
            clientEmail 
        } = req.body;

        // --- VALIDATION (Giữ nguyên logic cũ) ---
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
        // Lưu ý: Mapping các trường JSON sang cột Database
        const [projectResult] = await connection.query(
            `INSERT INTO Project 
            (project_name, project_desc, salary, pay_method, work_form, cID, project_status, approved_date) 
            VALUES (?, ?, ?, ?, ?, ?, 'Pending', NULL)`,
            [title, description, budget, paymentMethod, workForm, clientID]
        );

        const newProjectId = projectResult.insertId;

        // 3. Xử lý Skills (Bảng Requires)
        // Logic: Nếu skill gửi lên là mảng ['Java', 'Nodejs']
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

        // Trả về kết quả chuẩn
        res.status(201).json({
            success: true,
            message: 'Your project has been sent for approval.',
            project: {
                id: newProjectId,
                title,
                description,
                budget,
                status: 'Pending',
                clientName,
                clientEmail,
                createdAt: new Date()
            }
        });

    } catch (error) {
        await connection.rollback(); // Hoàn tác nếu lỗi
        console.error('Error posting project:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    } finally {
        connection.release();
    }
});

// -----------------------------------------------------------------
// 2. GET /projects - Lấy danh sách dự án
// -----------------------------------------------------------------
router.get('/projects', async (req, res) => {
    try {
        // Query phức tạp để lấy cả skills (GROUP_CONCAT)
        const query = `
            SELECT 
                p.project_ID as id,
                p.project_name as title,
                p.project_desc as description,
                p.salary as budget,
                p.project_status as status,
                p.pay_method as paymentMethod,
                p.work_form as workForm,
                p.approved_date as createdAt, -- hoặc cột created_at nếu bạn thêm sau này
                u.full_name as clientName,
                u.email as clientEmail,
                -- Gom nhóm skill thành chuỗi "Java,PHP,Python"
                GROUP_CONCAT(s.skill_name) as skills
            FROM Project p
            JOIN Client c ON p.cID = c.client_ID
            JOIN User u ON c.client_ID = u.ID
            LEFT JOIN Requires r ON p.project_ID = r.project_id
            LEFT JOIN Skill s ON r.skill_id = s.skill_ID
            GROUP BY p.project_ID
            ORDER BY p.project_ID DESC
        `;

        const [rows] = await pool.query(query);

        // Map dữ liệu để skill trở thành Array thay vì String
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
// 4. PATCH /projects/:projectId/hire - Thuê Freelancer (Accept Bid)
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

        // 1. Kiểm tra Project có tồn tại và đang Open không
        const [projects] = await connection.query("SELECT * FROM Project WHERE project_ID = ?", [projectId]);
        if (projects.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // 2. Cập nhật trạng thái Bid được chọn thành 'Accepted'
        await connection.query(
            "UPDATE Bid SET bid_status = 'Accepted' WHERE bid_id = ?", 
            [hired_bid_ID]
        );

        // 3. (Optional) Từ chối tất cả các Bid khác của dự án này
        await connection.query(
            "UPDATE Bid SET bid_status = 'Rejected' WHERE project_ID = ? AND bid_id != ?", 
            [projectId, hired_bid_ID]
        );

        // 4. Cập nhật trạng thái Project thành 'In Progress' (đúng logic DB ENUM)
        // project_status ENUM('Open', 'In Progress', 'Completed', 'Cancelled')
        await connection.query(
            "UPDATE Project SET project_status = 'In Progress' WHERE project_ID = ?", 
            [projectId]
        );

        await connection.commit();

        // Trả về thông tin cập nhật
        res.status(200).json({
            success: true,
            message: 'Freelancer hired successfully',
            project: {
                id: projectId,
                status: 'In Progress',
                hired_bid_ID: hired_bid_ID
            }
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