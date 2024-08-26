import express from "express";
import { getPreSignedUrl } from "../controller/watchcontroller";
const watch_router = express.Router();

watch_router.get('/preSignerUrl',getPreSignedUrl);

export default watch_router;