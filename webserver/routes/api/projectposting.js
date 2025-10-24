import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);
const router = express.Router();

const PROJECTS_FILE = path.join(__dirName, '../../data/projects.json');

// Helper functions để đọc/ghi file JSON
const readProjectsData = async () => {
    try {
        const data = await fs.readFile(PROJECTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Nếu file không tồn tại, trả về structure mặc định
        return { projects: [] };
    }
};

const writeProjectsData = async (data) => {
    try {
        // Đảm bảo thư mục data tồn tại
        await fs.mkdir(path.dirname(PROJECTS_FILE), { recursive: true });
        await fs.writeFile(PROJECTS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        throw new Error('Không thể ghi file dữ liệu');
    }
};

// POST - Đăng tin dự án mới
router.post('/projects', async (req, res) => {
    try {
        console.log(' Nhận request đăng tin dự án:', req.body);
        
        const { 
            title, 
            description, 
            budget, 
            duration, 
            category, 
            skills,
            paymentMethod,
            workFormat,
            clientId,
            clientName,
            clientEmail
        } = req.body;

        // Validation chi tiết với thông báo cụ thể
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tên dự án'
            });
        }

        if (!description) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập mô tả dự án'
            });
        }

        if (!budget) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập ngân sách'
            });
        }

        if (!duration) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập thời gian thực hiện'
            });
        }

        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn danh mục'
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn phương thức thanh toán'
            });
        }

        if (!workFormat) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn hình thức làm việc'
            });
        }

        if (title.trim().length < 5) {
            return res.status(400).json({
                success: false,
                message: 'Tên dự án phải có ít nhất 5 ký tự'
            });
        }

        if (description.trim().length < 20) {
            return res.status(400).json({
                success: false,
                message: 'Mô tả dự án phải có ít nhất 20 ký tự'
            });
        }

      

        if (budget < 1000000) {
            return res.status(400).json({
                success: false,
                message: 'Ngân sách tối thiểu là 1,000,000 VND'
            });
        }

        if (budget > 100000000000) {
            return res.status(400).json({
                success: false,
                message: 'Ngân sách không được vượt quá 10 Tỷ VND'
            });
        }

       

        if (duration < 1) {
            return res.status(400).json({
                success: false,
                message: 'Thời gian thực hiện phải ít nhất 1 ngày'
            });
        }

        if (duration > 365) {
            return res.status(400).json({
                success: false,
                message: 'Thời gian thực hiện không được vượt quá 365 ngày'
            });
        }

        // Đọc dữ liệu hiện tại
        const data = await readProjectsData();
        
        // Tạo project mới (đã bỏ requirements, thêm paymentMethod và workFormat)
        const newProject = {
            id: `project_${Date.now()}`,
            title: title.trim(),
            description: description.trim(),
            budget: parseInt(budget),
            duration: parseInt(duration),
            category,
            skills: Array.isArray(skills) ? skills : [],
            paymentMethod, // ✅ THÊM: Phương thức thanh toán
            workFormat,    // ✅ THÊM: Hình thức làm việc
            status: 'pending',
            clientId: clientId || 'unknown',
            clientName: clientName || 'Khách hàng',
            clientEmail: clientEmail || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            };

        console.log(' Tạo project mới:', newProject.title);

        // Thêm project vào mảng
        data.projects.unshift(newProject);
        
        // Lưu vào file JSON
        await writeProjectsData(data);
        
        console.log(' Đã lưu dự án:', newProject.title);
        
        res.status(201).json({
            success: true,
            message: 'Đăng tin dự án thành công! Tin đang chờ quản trị viên duyệt.',
            project: newProject
        });

    } catch (error) {
        console.error(' Lỗi khi đăng tin dự án:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đăng tin dự án: ' + error.message
        });
    }
});

// GET - Lấy danh sách tất cả dự án
router.get('/projects', async (req, res) => {
    try {
        const data = await readProjectsData();
        res.json({
            success: true,
            projects: data.projects
        });
    } catch (error) {
        console.error(' Lỗi khi đọc dự án:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đọc dữ liệu dự án'
        });
    }
});

// GET - Lấy dự án theo ID
router.get('/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await readProjectsData();
        const project = data.projects.find(p => p.id === id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy dự án'
            });
        }
        
        res.json({
            success: true,
            project
        });
    } catch (error) {
        console.error(' Lỗi khi lấy dự án:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

export default router;
