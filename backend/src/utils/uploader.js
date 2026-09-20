const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsBaseDir = path.join(__dirname, '../../uploads');

function getMulterUploader(folderName) {
  const targetDir = path.join(uploadsBaseDir, folderName);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, safeName);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  });
}

module.exports = { getMulterUploader, uploadsBaseDir };
