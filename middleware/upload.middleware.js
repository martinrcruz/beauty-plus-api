// upload.middleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegúrate de crear las carpetas si no existen
function ensureFolderExists(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

// Configuración para subir imágenes de perfil, por ejemplo, en /uploads/avatars
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(__dirname, '../uploads/avatars');
    ensureFolderExists(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Obtiene extensión original
    const ext = path.extname(file.originalname).toLowerCase();
    // Genera nombre único
    const filename = `avatar-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// Configuración para subir QR en /uploads/qr
const qrStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(__dirname, '../uploads/qr');
    ensureFolderExists(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `qr-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// Configuración para subir QR en /uploads/qr
const couponStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(__dirname, '../uploads/coupons');
    ensureFolderExists(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `coupon-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// Filtro de archivos para permitir solo imágenes
function imageFilter(req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);
  
  if (extName && mimeType) {
    return cb(null, true);
  }
  cb('Error: Solo se permiten archivos de imagen (JPG, PNG, GIF).');
}

// Creas dos funciones para subir:
// 1) Imágenes de Perfil
const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: imageFilter
});

// 2) Imágenes de QR
const uploadQR = multer({
  storage: qrStorage,
  fileFilter: imageFilter
});

// 2) Imágenes de Cupón
const uploadCoupon = multer({
  storage: couponStorage,
  fileFilter: imageFilter
});

module.exports = {
  uploadProfile,
  uploadQR,
  uploadCoupon
};
