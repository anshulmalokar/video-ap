import express from "express";
import { fetchVideos, getPreSignedUrl } from "../controller/watchcontroller";
const watch_router = express.Router();

watch_router.get('/preSignerUrl',getPreSignedUrl);

watch_router.get('/allVideos',fetchVideos);

export default watch_router;