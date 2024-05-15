import express from 'express';
import multer from 'multer';
import path from 'path';
import { isAdmin, isAuth } from '../utils.js';
import Product from '../models/productModel.js';
import fs from 'fs/promises';

const uploadRouter = express.Router();

// Set up multer storage for local file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const destinationDir = '../frontend/public/images/';
    try {
      await fs.mkdir(destinationDir, { recursive: true });
    } catch (err) {
      console.error('Error creating destination directory:', err);
    }
    cb(null, destinationDir);
  },
  filename: (req, file, cb) => {
    // Use the unique identifier as part of the filename
    const itemId = req.params.id; // Replace with the actual way you get the item ID
    const ext = path.extname(file.originalname);
    const filename = `${itemId}${ext}`;
    cb(null, filename); // Specify the filename for the uploaded file
  },
});

// Create multer instance with the specified storage configuration
const upload = multer({ storage });

// File upload endpoint without Cloudinary
uploadRouter.post('/:id', isAuth, isAdmin, upload.single('file'), async (req, res) => {
  try {
    // Access the uploaded file details using req.file
    const uploadedFile = req.file;
    const itemId = req.params.id;

    // Update the product in the database with the file information
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: itemId },
      { image: `/images/${uploadedFile.filename}` }
    );
    
    // Process the uploaded file as needed
    // For example, you can save the file information to your database or perform other actions
    
    // Send a response
    res.json({
      message: 'File uploaded successfully',
      file: uploadedFile,
    });
  } catch (err) {
    console.error('Error during file upload:', err);
    res.status(500).json({
      message: 'Internal Server Error',
      error: err.message,
    });
  }
});

export default uploadRouter;


// import express from 'express';
// import multer from 'multer';
// import { v2 as cloudinary } from 'cloudinary';
// import streamifier from 'streamifier';
// import { isAdmin, isAuth } from '../utils.js';

// const upload = multer();

// const uploadRouter = express.Router();

// uploadRouter.post(
//   '/',
//   isAuth,
//   isAdmin,
//   upload.single('file'),
//   async (req, res) => {
//     cloudinary.config({
//       cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//       api_key: process.env.CLOUDINARY_API_KEY,
//       api_secret: process.env.CLOUDINARY_API_SECRET,
//     });
//     const streamUpload = (req) => {
//       return new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream((error, result) => {
//           if (result) {
//             resolve(result);
//           } else {
//             reject(error);
//           }
//         });
//         streamifier.createReadStream(req.file.buffer).pipe(stream);
//       });
//     };
//     const result = await streamUpload(req);
//     res.send(result);
//   }
// );
// export default uploadRouter;
