import express from "express";
import multer from "multer";
import { upload_controller } from "../controller/uploadController";
import { doMultiPartUpload } from "../controller/multiPartUploadController";
const upload = multer();
const upload_router = express.Router();

upload_router.post('/',upload.single('file'),upload_controller)
upload_router.post('/multipart',doMultiPartUpload);
export default upload_router;