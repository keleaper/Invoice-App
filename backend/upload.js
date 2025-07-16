// This is my upload Route that is sent over to the server

import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import db from "./db.js";


let uploadedFiles = [];

const uploadRoute = express.Router(); // same as in our server. Instead of app here it is uploadRoute. So it will be uploadRoute.post instead of app.post

// Image Upload
const __filename = fileURLToPath(import.meta.url); // converts file:// URL string to a regular file path string. and __filename holds the full path of the current file
const __dirname = path.dirname(__filename); // extracts the directory name of the file path. and __dirname = current file's folder path

// Makes sure the uploads folder exists
const uploadFolder = path.join(__dirname, "uploads");

try {
    await fs.mkdir(uploadFolder, { recursive: true });
    console.log("Uploads folder is ready.");
} catch (err) {
    console.error("Failed to create folder:", err);
}

// Set storage config for multer. storing file in uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");  // (uploadFolder)
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-"); // replaces spaces with dashes
    const uniqueName = `${Date.now()}-${safeName}`;
    file.uniqueName = uniqueName;
    cb(null, uniqueName)
  },
});
// path.join ensures the correct absolute path is used across different OS's


// multer middleware handles file uploads. files are temporarily stored in the uploads/ folder inside current files directory
const upload = multer({ storage });

{/* 
    uploadRoute.post("/upload", ...) - here
    +
    app.use("/", uploadRoute) - server.js
    =
    app responds to - POST http://localhost:5000/upload
*/}

// Accept multiple files under the "invoice" field
uploadRoute.post("/upload", upload.array("invoice"), async (req, res) => {
    const userId = req.body.userId; // sent from frontend

    // exit if userId is not provided
    if (!userId) {
        return res.status(500).json({ message: "Missing userId" });
    }

    // Handles if no files are uploaded
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
    }

    try {
        const fileUrls = [];

        for (const file of req.files) {
            const filePath = `/uploads/${file.uniqueName}`;
            await db.query("INSERT INTO uploads (filename, filepath, user_id) VALUES ($1, $2, $3)", [file.originalname, filePath, userId]);
            fileUrls.push(filePath); // adds the filePath/file into the fileUrls array
        }

        uploadedFiles.push(...fileUrls); // spreads the files in the filePath array into the uploadedFiles array

        return res.status(200).json({ 
            success: true, 
            message: "Files uploaded successfully", 
            files: fileUrls 
        });

    } catch (err) {
        console.error("Upload error:", err);
        return res.status(500).json({ message: "Upload failed" });
    }
});

export default uploadRoute;