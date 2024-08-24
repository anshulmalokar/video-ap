import express from "express";
import multer from "multer";
import { upload_controller } from "../controller/uploadController";
const upload = multer();
const upload_router = express.Router();

upload_router.post('/',upload.single('file'),upload_controller)

export default upload_router;