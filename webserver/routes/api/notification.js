import express from 'express';
import pool from '../../config/db.js'; // Import kết nối DB

const router = express.Router();

// Hàm tạo ID unique (Giữ nguyên vì DB dùng VARCHAR cho ID thông báo)
const generateId = () => {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ==========================================
// SERVICE HELPER (Để dùng nội bộ trong code khác)
// ==========================================
export const createNotification = async (userEmail, type, data) => {
  try {
    const id = generateId();
    // Chuyển object data sang chuỗi JSON để lưu vào MySQL
    const jsonData = JSON.stringify(data);

    const query = `
      INSERT INTO Notification (id, userEmail, type, data, is_read, created_at)
      VALUES (?, ?, ?, ?, 0, NOW())
    `;

    await pool.query(query, [id, userEmail, type, jsonData]);

    // Trả về object đúng format frontend cần
    return {
      id,
      userEmail,
      type,
      data,
      read: false,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in createNotification service:', error);
    throw error;
  }
};

// ==========================================
// ROUTES
// ==========================================

// GET /api/notifications/unread-count - Đếm số thông báo chưa đọc
router.get('/unread-count', async (req, res) => {
  try {
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail is required' });
    }

    // is_read = 0 nghĩa là chưa đọc (false)
    const [rows] = await pool.query(
      "SELECT COUNT(*) as count FROM Notification WHERE userEmail = ? AND is_read = 0",
      [userEmail]
    );

    res.json({
      success: true,
      unreadCount: rows[0].count
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// GET /api/notifications - Lấy tất cả thông báo của user
router.get('/', async (req, res) => {
  try {
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail is required' });
    }

    const [rows] = await pool.query(
      "SELECT * FROM Notification WHERE userEmail = ? ORDER BY created_at DESC",
      [userEmail]
    );

    // Map lại dữ liệu cho khớp với frontend cũ
    const userNotifications = rows.map(row => ({
      id: row.id,
      userEmail: row.userEmail,
      type: row.type,
      data: row.data, // MySQL driver thường tự parse JSON column thành object
      read: Boolean(row.is_read), // Convert 0/1 sang false/true
      createdAt: row.created_at
    }));

    const unreadCount = userNotifications.filter(n => !n.read).length;

    res.json({
      success: true,
      notifications: userNotifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// PUT /api/notifications/:id/read - Đánh dấu ĐÃ ĐỌC một thông báo
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra thông báo có tồn tại không
    const [check] = await pool.query("SELECT * FROM Notification WHERE id = ?", [id]);
    if (check.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Cập nhật is_read = 1 (true)
    await pool.query("UPDATE Notification SET is_read = 1 WHERE id = ?", [id]);

    // Lấy lại thông báo đã update để trả về
    const [updatedRows] = await pool.query("SELECT * FROM Notification WHERE id = ?", [id]);
    const row = updatedRows[0];

    res.json({
      success: true,
      notification: {
        ...row,
        read: true, // Force true
        data: row.data
      }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PUT /api/notifications/read-all - Đánh dấu ĐÃ ĐỌC tất cả
router.put('/read-all', async (req, res) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail is required' });
    }

    // Update toàn bộ thông báo của email này thành is_read = 1
    const [result] = await pool.query(
      "UPDATE Notification SET is_read = 1 WHERE userEmail = ? AND is_read = 0",
      [userEmail]
    );

    res.json({
      success: true,
      updatedCount: result.affectedRows
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// DELETE /api/notifications/:id - Xóa thông báo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM Notification WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// POST /api/notifications/create - API tạo thông báo (Internal use)
router.post('/create', async (req, res) => {
  try {
    const { userEmail, type, data } = req.body;

    if (!userEmail || !type) {
      return res.status(400).json({ error: 'userEmail and type are required' });
    }

    const notification = await createNotification(userEmail, type, data);

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

export default router;