import express from "express";
import { Request, Response } from "express";
import KafkaManager from "./utils/KafkaManager";
import convertToHLS from "./trasncode";
const app = express();

app.get("/", async (req: Request, res: Response) => {});

async function checkForCallbacks() {
  try {
    const _instance = await KafkaManager.getInstance();
    const topic = "transcode";
    const call_back = (value: string) => {
      console.log("Recieved message " + value);
      const response:{
        file_name: string
      } = JSON.parse(value);
      const {file_name} = response;
      console.log(`Received callback from Kafka: ${file_name}`);
      convertToHLS(file_name);
    };
    await _instance.subscribe(topic, call_back);
  } catch (e) {
    console.log("Unable to Subscribe");
  }
}
checkForCallbacks();
app.listen(8080, () => {
  console.log(`Transcoder Server Started at Port ${8080}`);
});
