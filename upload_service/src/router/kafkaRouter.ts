import express from "express";
import { addMsgToTopic } from "../controller/kafkacontrollr";
const kafka_router = express.Router();

kafka_router.post('/',addMsgToTopic);

export default kafka_router;