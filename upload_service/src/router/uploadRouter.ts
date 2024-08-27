import express from "express";
import multer from "multer";
import { upload_controller } from "../controller/uploadController";
import { completeMultipartUpload, doMultiPartUpload, getPreSignedUrlForPart, startMultiPartUpload } from "../controller/multiPartUploadController";
import { uploadToDb } from "../controller/dbOperationsController";
const upload = multer();
const upload_router = express.Router();

// upload_router.post('/',upload.single('file'),upload_controller)
upload_router.get("/",(req,res) => {
    return res.json({
        message: "Hello World"
    });
})
upload_router.post('/multipart',doMultiPartUpload);
// upload_router.post('/getUplloadMultipartId',startMultiPartUpload);
// upload_router.post('/uploadChunk',upload.single('chunk'),uploadChunkController);

upload_router.post("/beginMultiPartUpload",startMultiPartUpload);
upload_router.post("/getPartPreSignedUrl",getPreSignedUrlForPart);
upload_router.post('/uploadComplete',completeMultipartUpload);
upload_router.post('/addVideoDetails',uploadToDb);

export default upload_router;