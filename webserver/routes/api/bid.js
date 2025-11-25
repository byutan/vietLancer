import express from 'express';
import pool from '../../config/db.js'; // Import kết nối DB
import NotificationService from '../../utils/notificationService.js';

const router = express.Router();

// webserver/routes/api/bid.js

// ... imports ...

// 🔥 API MỚI: Lấy TẤT CẢ Bids (Không lọc status)
// URL: /api/projects/bids/all
router.get('/projects/bids/all', async (req, res) => {
    try {
        const query = `
            SELECT 
                b.bid_id,
                b.bid_desc,
                b.price_offer,
                b.bid_status,
                b.bid_date,
                b.project_ID,
                p.project_name,
                u.full_name as freelancer_name,
                u.email as freelancer_email
            FROM Bid b
            JOIN Project p ON b.project_ID = p.project_ID
            JOIN User u ON b.fID = u.ID
            -- ❌ ĐÃ BỎ DÒNG: WHERE b.bid_status = 'Pending' 
            ORDER BY b.bid_date DESC
        `;

        const [bids] = await pool.query(query);
        res.json({ success: true, bids });

    } catch (error) {
        console.error('Error getting all bids:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// ============================================================
// 1. POST /api/projects/:id/bid - Freelancer gửi bid
// ============================================================
router.post('/projects/:id/bid', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params; // Project ID
        const { freelancer_email, bid_desc, price_offer } = req.body;

        if (!freelancer_email || !bid_desc || !price_offer) {
            return res.status(400).json({ success: false, message: 'Missing required fields.' });
        }

        // --- BẮT ĐẦU TRANSACTION ---
        await connection.beginTransaction();

        // 1. Lấy thông tin Freelancer từ Email
        // Ta cần lấy ID của User để lưu vào cột fID trong bảng Bid
        const [users] = await connection.query(
            "SELECT ID, full_name FROM User WHERE email = ?", 
            [freelancer_email]
        );
        
        if (users.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Freelancer account not found.' });
        }
        const freelancerId = users[0].ID;
        const freelancerName = users[0].full_name;

        // 2. Lấy thông tin Project
        // Ta cần cID (Client ID) để lưu vào bảng Bid (theo schema của bạn có cột cID trong bảng Bid)
        const [projects] = await connection.query(
            "SELECT project_ID, project_name, project_status, cID FROM Project WHERE project_ID = ?", 
            [id]
        );

        if (projects.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }

        const project = projects[0];

        // 3. Kiểm tra trạng thái dự án
        // Trong DB: project_status ENUM('Open', 'In Progress', 'Completed', 'Cancelled')
        // Logic cũ check 'approved', logic mới check 'Open'
        if (project.project_status !== 'Open') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Can only bid on Open projects.' });
        }

        // 4. Insert vào bảng Bid
        // Schema: Bid (bid_desc, price_offer, bid_status, bid_date, project_ID, fID, cID)
        const [insertResult] = await connection.query(
            `INSERT INTO Bid (bid_desc, price_offer, bid_status, bid_date, project_ID, fID, cID)
             VALUES (?, ?, 'Pending', NOW(), ?, ?, ?)`,
            [bid_desc, price_offer, project.project_ID, freelancerId, project.cID]
        );

        const newBidId = insertResult.insertId;

        // --- COMMIT TRANSACTION ---
        await connection.commit();

        // 5. Gửi thông báo
        try {
            await NotificationService.notifyBidSubmitted(freelancer_email, {
                bidId: newBidId,
                projectId: project.project_ID,
                projectName: project.project_name,
                bidAmount: price_offer
            });
            console.log(`Notification sent to ${freelancer_email}`);
        } catch (notifError) {
            console.error('Failed to send notification:', notifError);
        }

        res.json({
            success: true,
            message: 'Bid submitted successfully.',
            bid: {
                bid_ID: newBidId,
                freelancer_name: freelancerName,
                freelancer_email: freelancer_email,
                price_offer,
                bid_status: 'Pending',
                bid_date: new Date()
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error submitting bid:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    } finally {
        connection.release();
    }
});

// ============================================================
// 2. POST .../approve - Mod (hoặc Client) duyệt/từ chối bid
// ============================================================
router.post('/projects/:projectId/bid/:bidId/approve', async (req, res) => {
    const { projectId, bidId } = req.params;
    const { status } = req.body; // 'accepted' hoặc 'rejected'

    // Map status từ API sang status của DB (viết hoa chữ đầu)
    // API: 'accepted' -> DB: 'Accepted'
    const dbStatus = status.charAt(0).toUpperCase() + status.slice(1);

    if (!['Accepted', 'Rejected'].includes(dbStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid status. Must be "accepted" or "rejected".' });
    }

    const connection = await pool.getConnection();

    try {
        // 1. Lấy thông tin Bid và Email freelancer để gửi noti
        const query = `
            SELECT b.*, u.email as freelancer_email, p.project_name, p.cID
            FROM Bid b
            JOIN User u ON b.fID = u.ID
            JOIN Project p ON b.project_ID = p.project_ID
            WHERE b.bid_id = ? AND b.project_ID = ?
        `;
        const [rows] = await connection.query(query, [bidId, projectId]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Bid not found.' });
        }
        const bidData = rows[0];

        // 2. Cập nhật trạng thái Bid
        await connection.query(
            "UPDATE Bid SET bid_status = ? WHERE bid_id = ?",
            [dbStatus, bidId]
        );

        // 3. (Optional) Nếu Accept bid -> Cập nhật Project sang 'In Progress' luôn?
        // Tùy logic nghiệp vụ của bạn. Ở đây mình giữ nguyên chỉ update Bid.

        // 4. Gửi thông báo
        try {
            if (dbStatus === 'Accepted') {
                 // Lấy email Client để gửi cho freelancer liên hệ
                 const [clientUser] = await connection.query("SELECT email FROM User WHERE ID = ?", [bidData.cID]);
                 const clientEmail = clientUser.length > 0 ? clientUser[0].email : '';

                await NotificationService.notifyBidApproved(bidData.freelancer_email, {
                    bidId: bidData.bid_id,
                    projectId: projectId,
                    projectName: bidData.project_name,
                    bidAmount: bidData.price_offer,
                    clientEmail: clientEmail
                });
            } else {
                await NotificationService.notifyBidRejected(bidData.freelancer_email, {
                    bidId: bidData.bid_id,
                    projectId: projectId,
                    projectName: bidData.project_name
                });
            }
        } catch (notifError) {
            console.error('Notification error:', notifError);
        }

        res.json({
            success: true,
            message: `Bid ${status} successfully.`,
            bid: { ...bidData, bid_status: dbStatus }
        });

    } catch (error) {
        console.error('Error approving/rejecting bid:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    } finally {
        connection.release();
    }
});

// ============================================================
// 3. GET /projects/:id/bids - Lấy danh sách bids của 1 project
// ============================================================
router.get('/projects/:id/bids', async (req, res) => {
    try {
        const { id } = req.params;

        // Query join bảng User để lấy tên Freelancer
        const query = `
            SELECT 
                b.bid_id as bid_ID,
                b.bid_desc,
                b.price_offer,
                b.bid_status,
                b.bid_date,
                u.full_name as freelancer_name,
                u.email as freelancer_email,
                -- Lấy thêm cột client_status (giả lập từ bid_status) để frontend cũ không lỗi
                CASE 
                    WHEN b.bid_status = 'Rejected' THEN 'client_rejected' 
                    ELSE NULL 
                END as client_status
            FROM Bid b
            JOIN User u ON b.fID = u.ID
            WHERE b.project_ID = ?
            ORDER BY b.bid_date DESC
        `;

        const [bids] = await pool.query(query, [id]);

        // Lấy tên project (để trả về đúng format cũ)
        const [projects] = await pool.query("SELECT project_name FROM Project WHERE project_ID = ?", [id]);
        
        if (projects.length === 0) {
             return res.status(404).json({ success: false, message: 'Project not found.' });
        }

        res.json({
            success: true,
            projectId: id,
            projectName: projects[0].project_name,
            bids: bids
        });

    } catch (error) {
        console.error('Error getting bids:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// webserver/routes/api/bid.js

// ... (các route khác)

// ============================================================
// 4. GET /freelancer/bids - Lấy bids của Freelancer (Kèm thông tin Project & Client)
// ============================================================
router.get('/freelancer/bids', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ success: false, message: 'Email required.' });

        const connection = await pool.getConnection();

        try {
            // 1. Tìm ID của freelancer
            const [users] = await connection.query("SELECT ID FROM User WHERE email = ?", [email]);
            if (users.length === 0) {
                return res.json({ success: true, freelancerEmail: email, totalBids: 0, bids: [] });
            }
            const freelancerId = users[0].ID;

            // 2. Query Bids + Project + Client Info
            const query = `
                SELECT 
                    b.bid_id,
                    b.bid_desc,
                    b.price_offer,
                    b.bid_status,
                    b.bid_date,
                    
                    p.project_ID,
                    p.project_name,
                    p.project_desc,
                    p.project_status,
                    
                    -- Lấy thông tin Client (Chủ dự án)
                    u_client.full_name as clientName,
                    u_client.email as clientEmail
                FROM Bid b
                JOIN Project p ON b.project_ID = p.project_ID
                JOIN Client c ON p.cID = c.client_ID
                JOIN User u_client ON c.client_ID = u_client.ID
                WHERE b.fID = ?
                ORDER BY b.bid_date DESC
            `;

            const [bids] = await connection.query(query, [freelancerId]);

            res.json({
                success: true,
                freelancerEmail: email,
                bids: bids
            });
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error getting freelancer bids:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================================================
// 5. PATCH .../bids/:bidId - Client từ chối (Reject)
// ============================================================
router.patch('/projects/:projectId/bids/:bidId', async (req, res) => {
    const { projectId, bidId } = req.params;
    const { client_status } = req.body; 

    // Logic cũ: client_status = 'client_rejected'
    // Logic mới: Update cột bid_status = 'Rejected'
    
    if (client_status !== 'client_rejected') {
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    try {
        // Kiểm tra xem Bid có thuộc Project này không
        const [check] = await pool.query(
            "SELECT bid_id FROM Bid WHERE bid_id = ? AND project_ID = ?", 
            [bidId, projectId]
        );

        if (check.length === 0) {
            return res.status(404).json({ success: false, message: 'Bid not found in this project' });
        }

        // Update Database
        await pool.query(
            "UPDATE Bid SET bid_status = 'Rejected' WHERE bid_id = ?",
            [bidId]
        );

        res.status(200).json({
            success: true,
            message: 'Bid rejected successfully'
        });

    } catch (error) {
        console.error('Error rejecting bid:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});



export default router;