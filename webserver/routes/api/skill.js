import express from 'express';
import pool from '../../config/db.js'; // Import kết nối DB

const router = express.Router();

// ============================================================
// GET /api/skills - Lấy danh sách tất cả kỹ năng gợi ý
// ============================================================
router.get('/skills', async (req, res) => {
    try {
        // 1. Truy vấn lấy tất cả tên kỹ năng, sắp xếp theo alpha
        const [rows] = await pool.query("SELECT skill_name FROM Skill ORDER BY skill_name ASC");
        
        // 2. Chuyển đổi kết quả từ dạng Object [{skill_name: 'Java'}, ...] sang mảng String ['Java', ...]
        // Để frontend dễ dàng hiển thị trong dropdown
        const skills = rows.map(row => row.skill_name);
        
        res.json({ 
            success: true, 
            skills: skills 
        });

    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching skills' 
        });
    }
});

export default router;