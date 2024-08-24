import {
  Consumer,
  IHeaders,
  Kafka,
  Producer,
  KafkaConfig,
  Message,
} from "kafkajs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();
class KafkaManager {
  public static _instance: KafkaManager;
  private kafka_producer: Producer;
  private kafka_consumer: Consumer;
  private kafka;
  private constructor() {
    const ca_file_path = path.join(__dirname,"../../certs/ca.pem");
    const config: KafkaConfig = {
        clientId: "youtube_uploader",
        brokers: [process.env.KAFKA_URL as string],
        ssl: {
            ca: [fs.readFileSync(ca_file_path, "utf-8")]
        },
        sasl: {
            username: process.env.KAFKA_USERNAME as string,
            password: process.env.KAFKA_PASSWORD as string,
            mechanism: "plain"
        }
    }
    this.kafka = new Kafka(config);
    this.kafka_producer = this.kafka.producer();
    this.kafka_consumer = this.kafka.consumer({ groupId: "" });
  }
  public static getInstance(): KafkaManager {
    if (!KafkaManager._instance) {
      this._instance = new KafkaManager();
      return this._instance;
    }
    return this._instance;
  }

  public async subscribe(topic: string, callback: (value: string) => void) {
    try {
      await this.kafka_consumer.connect();
      await this.kafka_consumer.subscribe({
        topic: topic,
        fromBeginning: true,
      });
      await this.kafka_consumer.run({
        eachMessage: async ({
          topic,
          partition,
          message,
        }: {
          topic: string;
          partition: any;
          message: Message;
        }) => {
          const value = message.value?.toString();
          callback(value as string);
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  public async publish(
    topic: string,
    message: {
      key?: Buffer | string | null;
      value: Buffer | string | null;
      partition?: number;
      headers?: IHeaders;
      timestamp?: string;
    }
  ) {
    try {
      await this.kafka_producer.connect();
      this.kafka_producer.send({
        topic: topic,
        messages: [message],
      });
    } catch (e) {
      console.log(e);
    } finally {
      await this.kafka_producer.disconnect();
    }
  }
}
export default KafkaManager;
