// uploadRoute.js
import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".doc" && ext !== ".docx") {
      return cb(new Error("Chỉ cho phép file .doc hoặc .docx"));
    }
    cb(null, true);
  },
});

router.post("/upload-contract", upload.single("contract"), (req, res) => {
  console.log("File uploaded:", req.file);
  res.json({ url: `/uploads/${req.file.filename}`, originalName: req.file.originalname });
});

export default router;
