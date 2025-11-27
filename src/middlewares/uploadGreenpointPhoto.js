import multer from 'multer';
import { extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storageDir = join(__dirname, '..', 'storage', 'greenpoint_photo');
await mkdir(storageDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    const fileUuid = uuidv4();
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${fileUuid}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo imágenes'), false);
  }
};

const uploadGreenpointPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export default uploadGreenpointPhoto;
