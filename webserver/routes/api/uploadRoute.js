import express from "express";
import multer from "multer";
import path from "path";
import pool from "../../config/db.js"; // Import kết nối database

const router = express.Router();

// 1. Cấu hình Storage để giữ nguyên đuôi file và tránh trùng tên
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu file (nhớ tạo thư mục này ở root dự án)
  },
  filename: (req, file, cb) => {
    // Đặt tên file: timestamp-tên-gốc (ví dụ: 1715000-hopdong.docx)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".doc" && ext !== ".docx") {
      return cb(new Error("Chỉ cho phép file .doc hoặc .docx"));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB (tùy chỉnh)
});

// 2. Route Upload và Lưu vào Database
router.post("/upload-contract", upload.single("contract"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Vui lòng chọn file để upload" });
    }

    const { style } = req.body; // Lấy thêm thông tin mô tả (nếu có) từ form
    
    // Đường dẫn tương đối để lưu vào DB (để frontend gọi được)
    const fileUrl = `/uploads/${req.file.filename}`;

    // Insert vào bảng Contract_template trong MySQL
    const query = "INSERT INTO Contract_template (template_URL, style) VALUES (?, ?)";
    const [result] = await pool.query(query, [fileUrl, style || 'Standard']);

    console.log("File uploaded & DB updated:", req.file.filename);

    // Trả về kết quả cho Frontend
    res.status(201).json({
      message: "Upload thành công",
      template_id: result.insertId,
      url: fileUrl,
      originalName: req.file.originalname
    });

  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Lỗi server khi upload file" });
  }
});

export default router;