import express from "express";
import multer from "multer";
import { upload_controller } from "../controller/uploadController";
import { completeMultipartUpload, doMultiPartUpload, startMultiPartUpload, uploadChunkController } from "../controller/multiPartUploadController";
const upload = multer();
const upload_router = express.Router();

upload_router.post('/',upload.single('file'),upload_controller)
upload_router.post('/multipart',doMultiPartUpload);

upload_router.post('/getUplloadMultipartId',upload.none(),startMultiPartUpload);
upload_router.post('/uploadChunk',upload.single('chunk'),uploadChunkController);
upload_router.post('/uploadComplete',completeMultipartUpload);

export default upload_router;