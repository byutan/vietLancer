// contract.js
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.join(__dirname, "../../uploads");

// ✅ Lấy danh sách file template (.doc, .docx)
router.get("/list-templates", (req, res) => {
  try {
    const files = fs
      .readdirSync(templatesDir)
      .filter((f) => f.endsWith(".doc") || f.endsWith(".docx"));
    res.json(files);
  } catch (err) {
    console.error("Error reading templates:", err);
    res.status(500).json({ error: "Cannot load templates" });
  }
});

// ✅ Xuất file Word (cho phép tải về)
router.get("/export/:filename", (req, res) => {
  const filePath = path.join(templatesDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  res.download(filePath, req.params.filename);
});

// ✅ Xem trước file qua Google Docs Viewer (giống Drive preview)
router.get("/preview/:filename", (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(templatesDir, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  // URL public để Google Docs đọc file
  const fileUrl = `http://localhost:3000/uploads/${fileName}`;

  // Gửi trang HTML chứa iframe nhúng Google Docs Viewer
  const iframeHtml = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0; padding:0; height:100vh; overflow:hidden;">
        <iframe 
          src="https://docs.google.com/gview?url=${fileUrl}&embedded=true"
          style="width:100%; height:100%; border:none;"
          frameborder="0">
        </iframe>
      </body>
    </html>
  `;
  res.send(iframeHtml);
});

export default router;
