import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// ES6 modules không có __dirname, cần tạo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOTIFICATIONS_FILE = path.join(__dirname, '../../data/notifications.json');

// Ensure data directory exists
const ensureDataDir = async () => {
  const dataDir = path.join(__dirname, '../../data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Load notifications from JSON
const loadNotifications = async () => {
  try {
    await ensureDataDir();
    const data = await fs.readFile(NOTIFICATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
};

// Save notifications to JSON
const saveNotifications = async (notifications) => {
  await ensureDataDir();
  await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
};

// Generate unique ID
const generateId = () => {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create notification
export const createNotification = async (userId, type, data) => {
  const notifications = await loadNotifications();
  
  const notification = {
    id: generateId(),
    userId,
    type, // 'project_submitted', 'project_approved', 'project_rejected', 'bid_submitted', 'bid_approved', 'bid_rejected'
    data,
    read: false,
    createdAt: new Date().toISOString()
  };
  
  notifications.push(notification);
  await saveNotifications(notifications);
  
  return notification;
};

// GET /api/notifications - Get all notifications for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const notifications = await loadNotifications();
    const userNotifications = notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      notifications: userNotifications,
      unreadCount: userNotifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// GET /api/notifications/unread-count - Get unread count
router.get('/unread-count', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const notifications = await loadNotifications();
    const unreadCount = notifications.filter(n => n.userId === userId && !n.read).length;
    
    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notifications = await loadNotifications();
    const notification = notifications.find(n => n.id === id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    notification.read = true;
    await saveNotifications(notifications);
    
    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const notifications = await loadNotifications();
    let updatedCount = 0;
    
    notifications.forEach(n => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        updatedCount++;
      }
    });
    
    await saveNotifications(notifications);
    
    res.json({
      success: true,
      updatedCount
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let notifications = await loadNotifications();
    const initialLength = notifications.length;
    
    notifications = notifications.filter(n => n.id !== id);
    
    if (notifications.length === initialLength) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    await saveNotifications(notifications);
    
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// POST /api/notifications/create - Create notification (internal use)
router.post('/create', async (req, res) => {
  try {
    const { userId, type, data } = req.body;
    
    if (!userId || !type) {
      return res.status(400).json({ error: 'userId and type are required' });
    }
    
    const notification = await createNotification(userId, type, data);
    
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