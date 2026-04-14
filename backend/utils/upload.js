const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.uploadType || "general";
    const dir = path.join(__dirname, "../uploads", type);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const sanitized = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${sanitized}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /pdf|mp4|mov|avi|mkv|webm|jpeg|jpg|png|gif|ppt|pptx|doc|docx/;
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${ext} is not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
});

module.exports = upload;
