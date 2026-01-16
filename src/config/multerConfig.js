import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Map fieldnames to their respective folders
    const folderMap = {
      aadhar: 'uploads/aadhar/',
      pan: 'uploads/pan/',
      selfie: 'uploads/selfie/',
      bankStatement: 'uploads/bankStatement/',
      cibilScore: 'uploads/cibilScore/',
      residentialAddressProof: 'uploads/residentialAddressProof/',
      employmentAddressProof: 'uploads/employmentAddressProof/'
    };

    const folder = folderMap[file.fieldname] || 'uploads/others/';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|bmp|webp|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, JPG, PNG, GIF, BMP, WEBP) and PDF files are allowed!'));
  }
};

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: fileFilter
});