import { Request, Response } from "express";
import KafkaManager from "../utils/KafkaManager";
import fs from "fs";
import path from "path";
export const addMsgToTopic = async (req: Request, res: Response) => {
  try {
    const instance = await KafkaManager.getInstance();
    const topic = req.body.topic;
    const message: {
      key?: Buffer | string | null;
      value: Buffer | string | null;
    } = req.body.message;
    await instance.publish(topic, message);
    return res.status(200).json({
      message: "Message added to the topic successfully"
    })
  } catch (e) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};
