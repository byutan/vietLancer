import express from 'express';
import pool from '../../config/db.js'; // Import kết nối DB
import NotificationService from '../../utils/notificationService.js';

const router = express.Router();

// ============================================================
// 1. GET /projects/bids/all - Lấy TẤT CẢ Bids (Cho Admin/Moderator)
// ============================================================
router.get('/projects/bids/all', async (req, res) => {
    try {
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
                p.salary as project_budget,
                p.project_status,
                
                u_free.full_name as freelancer_name,
                u_free.email as freelancer_email,
                
                u_client.full_name as client_name,
                u_client.email as client_email
            FROM Bid b
            JOIN Project p ON b.project_ID = p.project_ID
            JOIN User u_free ON b.fID = u_free.ID
            JOIN Client c ON p.cID = c.client_ID
            JOIN User u_client ON c.client_ID = u_client.ID
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
// 2. GET /projects/freelancer/bids - Lấy bids của Freelancer
// (🔥 QUAN TRỌNG: Đặt route này TRƯỚC route /:id/bids để tránh lỗi 404)
// ============================================================
router.get('/projects/freelancer/bids', async (req, res) => {
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
                    
                    u_client.full_name as clientName,
                    u_client.email as clientEmail,
                    u_client.phone_number as clientPhone
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
// 3. POST /api/projects/:id/bid - Freelancer gửi bid
// ============================================================
router.post('/projects/:id/bid', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params; // Project ID
        const { freelancer_email, bid_desc, price_offer } = req.body;

        if (!freelancer_email || !bid_desc || !price_offer) {
            return res.status(400).json({ success: false, message: 'Missing required fields.' });
        }

        await connection.beginTransaction();

        // 1. Lấy thông tin Freelancer
        const [users] = await connection.query("SELECT ID, full_name FROM User WHERE email = ?", [freelancer_email]);
        if (users.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Freelancer account not found.' });
        }
        const freelancerId = users[0].ID;
        const freelancerName = users[0].full_name;

        // 2. Lấy thông tin Project
        const [projects] = await connection.query("SELECT project_ID, project_name, project_status, cID FROM Project WHERE project_ID = ?", [id]);
        if (projects.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }
        const project = projects[0];

        // 3. Check Status
        if (project.project_status !== 'Open') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Can only bid on Open projects.' });
        }

        // 4. Insert Bid
        const [insertResult] = await connection.query(
            `INSERT INTO Bid (bid_desc, price_offer, bid_status, bid_date, project_ID, fID, cID)
             VALUES (?, ?, 'Pending', NOW(), ?, ?, ?)`,
            [bid_desc, price_offer, project.project_ID, freelancerId, project.cID]
        );

        const newBidId = insertResult.insertId;
        await connection.commit();

        // 5. Gửi thông báo cho Freelancer
        try {
            await NotificationService.notifyBidSubmitted(freelancer_email, {
                bidId: newBidId,
                projectId: project.project_ID,
                projectName: project.project_name,
                bidAmount: price_offer
            });
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
// 4. POST .../approve - Mod duyệt/từ chối bid (Admin Action)
// ============================================================
router.post('/projects/:projectId/bid/:bidId/approve', async (req, res) => {
    const { projectId, bidId } = req.params;
    const { status } = req.body; // 'accepted' hoặc 'rejected'

    // Map status (viết hoa chữ đầu)
    const dbStatus = status.charAt(0).toUpperCase() + status.slice(1);

    if (!['Accepted', 'Rejected'].includes(dbStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const connection = await pool.getConnection();

    try {
        // 1. Lấy thông tin Bid + Freelancer + Project
        const query = `
            SELECT b.*, u.email as freelancer_email, u.full_name as freelancer_name, p.project_name, p.cID
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

        // 2. Update Status
        await connection.query("UPDATE Bid SET bid_status = ? WHERE bid_id = ?", [dbStatus, bidId]);

        // 3. Gửi thông báo
        try {
            // Lấy email của Client (Chủ dự án)
            const [clientUser] = await connection.query("SELECT email FROM User WHERE ID = ?", [bidData.cID]);
            const clientEmail = clientUser.length > 0 ? clientUser[0].email : null;

            if (dbStatus === 'Accepted') {
                // (A) Thông báo cho Freelancer: Admin đã duyệt
                await NotificationService.notifyBidApproved(bidData.freelancer_email, {
                    bidId: bidData.bid_id,
                    projectId: projectId,
                    projectName: bidData.project_name,
                    bidAmount: bidData.price_offer,
                    clientEmail: clientEmail || ''
                });

                // (B) 🔥 THÔNG BÁO CHO CLIENT: Có hồ sơ thầu mới được duyệt (Đây là phần bạn cần)
                if (clientEmail) {
                    await NotificationService.notifyNewBidReceived(clientEmail, {
                        bidId: bidData.bid_id,
                        projectId: projectId,
                        projectName: bidData.project_name,
                        freelancerName: bidData.freelancer_name,
                        bidAmount: bidData.price_offer
                    });
                    console.log(`Notification sent to CLIENT ${clientEmail} - New Bid Approved`);
                }

            } else {
                // Thông báo từ chối cho Freelancer
                await NotificationService.notifyBidRejected(bidData.freelancer_email, {
                    bidId: bidData.bid_id,
                    projectId: projectId,
                    projectName: bidData.project_name
                });
            }
        } catch (notifError) {
            console.error('Notification error:', notifError);
        }

        res.json({ success: true, message: `Bid ${status} successfully.` });

    } catch (error) {
        console.error('Error approving/rejecting bid:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    } finally {
        connection.release();
    }
});

// ============================================================
// 5. GET /projects/:id/bids - Lấy danh sách bids của 1 project (Cho Client/Public xem)
// ============================================================
router.get('/projects/:id/bids', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                b.bid_id as bid_ID,
                b.bid_desc,
                b.price_offer,
                b.bid_status,
                b.bid_date,
                u.full_name as freelancer_name,
                u.email as freelancer_email,
                CASE WHEN b.bid_status = 'Rejected' THEN 'client_rejected' ELSE NULL END as client_status
            FROM Bid b
            JOIN User u ON b.fID = u.ID
            WHERE b.project_ID = ?
            ORDER BY b.bid_date DESC
        `;

        const [bids] = await pool.query(query, [id]);
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

// ============================================================
// 6. PATCH .../bids/:bidId - Client từ chối (Reject)
// ============================================================
router.patch('/projects/:projectId/bids/:bidId', async (req, res) => {
    const { projectId, bidId } = req.params;
    const { client_status } = req.body; 

    if (client_status !== 'client_rejected') {
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    try {
        const [check] = await pool.query("SELECT bid_id, fID FROM Bid WHERE bid_id = ? AND project_ID = ?", [bidId, projectId]);
        if (check.length === 0) return res.status(404).json({ success: false, message: 'Bid not found' });
        
        const bidInfo = check[0];

        // Update Database
        await pool.query("UPDATE Bid SET bid_status = 'Rejected' WHERE bid_id = ?", [bidId]);

        // Gửi thông báo Freelancer bị từ chối
        try {
            const [users] = await pool.query("SELECT email FROM User WHERE ID = ?", [bidInfo.fID]);
            const [projs] = await pool.query("SELECT project_name FROM Project WHERE project_ID = ?", [projectId]);
            
            if (users.length > 0 && projs.length > 0) {
                await NotificationService.notifyBidRejected(users[0].email, {
                    bidId: bidId,
                    projectId: projectId,
                    projectName: projs[0].project_name
                });
            }
        } catch (e) { console.error(e); }

        res.status(200).json({ success: true, message: 'Bid rejected successfully' });

    } catch (error) {
        console.error('Error rejecting bid:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

export default router;