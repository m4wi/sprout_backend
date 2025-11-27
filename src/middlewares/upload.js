// middleware/upload.js
import multer from 'multer';
import { extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid'; // Importa UUID v4

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storageDir = join(__dirname, '..', 'storage', 'profile_photo');
await mkdir(storageDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    // Genera un UUID único
    const fileUuid = uuidv4();
    const ext = extname(file.originalname).toLowerCase();
    
    // Ejemplo: 550e8400-e29b-41d4-a716-446655440000.jpg
    cb(null, `${fileUuid}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes: JPG, PNG, WEBP'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

export default upload;