// src/config/upload.js
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");

// configure cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Generate a unique filename using timestamp + random number
    const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    // Determine the resource type based on mime type (or let cloudinary autodetect)
    let resource_type = "image";
    if (file.mimetype.includes("video")) resource_type = "video";
    if (file.mimetype.includes("pdf")) resource_type = "raw";

    return {
      folder: "dreamers_portfolio", // Cloudinary folder name
      format: path.extname(file.originalname).substring(1) || "png", // e.g. 'png', 'jpg'
      public_id: uniqueFileName,
      resource_type: resource_type,
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed (jpeg, jpg, png, webp)"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;
