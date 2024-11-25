import multer, { diskStorage } from 'multer';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import AppError from './error.js';
import fs from 'fs';

const dirPath = fileURLToPath(dirname(import.meta.url));
const uploadPath = join(dirPath, `../../${process.env.PUBLIC_DIR_PATH}/userProfile`);

// ensure upload directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const profileStorage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const fileName = `${file.fieldname}-${Date.now()}${extname(file.originalname)}`;
    cb(null, fileName);
  }
});

const profileFilter = (req, file, cb) => {
  const mimetype = file.mimetype.split('/')[0];
  if (mimetype === 'image') {
    return cb(null, true);
  } else {
    return cb(new AppError(400, "Profile must be an image file"), false);
  }
}

const uploadProfile = multer({ 
  storage: profileStorage, 
  fileFilter: profileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('profile');

const uploadProfileMiddleware = (req, res, next) => {
  uploadProfile(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error('Multer error:', err);
      return next(new AppError(400, `Upload error: ${err.message}`));
    } else if (err) {
      // An unknown error occurred
      console.error('Unknown error:', err);
      return next(err);
    }
    next();
  });
};

export default uploadProfileMiddleware;