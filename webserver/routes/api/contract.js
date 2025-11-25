import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../../config/db.js"; // Import kết nối DB

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Lấy danh sách file template từ Database
router.get("/list-templates", async (req, res) => {
  try {
    const query = "SELECT template_ID, template_URL, style FROM Contract_template";
    const [rows] = await pool.query(query);

    // Xử lý dữ liệu trả về để frontend dễ hiển thị
    const templates = rows.map(row => ({
      id: row.template_ID,
      url: row.template_URL, // Ví dụ: /uploads/1732000-hopdong.docx
      name: path.basename(row.template_URL), // Lấy tên file từ URL
      style: row.style || 'Standard'
    }));

    res.json(templates);
  } catch (err) {
    console.error("Error reading templates from DB:", err);
    res.status(500).json({ error: "Cannot load templates" });
  }
});

// ✅ Xuất file Word (Tải về dựa trên ID)
router.get("/export/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Lấy đường dẫn file từ DB
    const [rows] = await pool.query("SELECT template_URL FROM Contract_template WHERE template_ID = ?", [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "Template not found in database" });
    }

    const fileUrl = rows[0].template_URL; // Ví dụ: /uploads/abc.docx
    
    // 2. Chuyển đường dẫn tương đối thành đường dẫn tuyệt đối trên ổ cứng
    // Giả sử uploads nằm ở root dự án (ngang hàng với folder webserver)
    // Bạn có thể cần điều chỉnh số lượng '../' tùy cấu trúc thư mục thực tế
    const absolutePath = path.join(__dirname, "../../", fileUrl);

    // 3. Kiểm tra file có thật sự tồn tại trên ổ cứng không
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: "File physical path not found" });
    }

    // 4. Tải file về
    res.download(absolutePath);

  } catch (err) {
    console.error("Error exporting template:", err);
    res.status(500).json({ error: "Server error during export" });
  }
});

// ✅ Xem trước file qua Google Docs Viewer
// LƯU Ý QUAN TRỌNG: Google Docs KHÔNG THỂ đọc localhost. 
// Bạn cần public IP hoặc dùng ngrok thì tính năng này mới chạy được.
router.get("/preview/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Lấy thông tin từ DB
    const [rows] = await pool.query("SELECT template_URL FROM Contract_template WHERE template_ID = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).send("Template not found");
    }

    const relativeUrl = rows[0].template_URL; // /uploads/abc.docx
    const fileName = path.basename(relativeUrl);

    // 2. Tạo URL đầy đủ
    // Nếu bạn đang chạy localhost, hãy thay dòng này bằng domain thật hoặc ngrok url
    // Ví dụ: const DOMAIN = "https://my-website.com";
    const DOMAIN = "http://localhost:3000"; 
    const fullFileUrl = `${DOMAIN}${relativeUrl}`;

    // 3. Gửi trang HTML chứa iframe
    const iframeHtml = `
      <!DOCTYPE html>
      <html>
        <head>
            <title>Preview: ${fileName}</title>
        </head>
        <body style="margin:0; padding:0; height:100vh; overflow:hidden;">
          <iframe 
            src="https://docs.google.com/gview?url=${fullFileUrl}&embedded=true"
            style="width:100%; height:100%; border:none;"
            frameborder="0">
          </iframe>
          <div style="position:absolute; top:10px; right:10px; background:white; padding:10px;">
            <p style="margin:0; color:red; font-size:12px;">*Note: Google Docs cannot preview localhost urls.</p>
          </div>
        </body>
      </html>
    `;
    res.send(iframeHtml);

  } catch (err) {
    console.error("Error loading preview:", err);
    res.status(500).send("Server error");
  }
});

export default router;