import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import fs from "fs";
import ms from "mime-types";
dotenv.config();

const clientParams = {
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
};

const client = new S3Client(clientParams);

export class AwsService {
  private static instance: AwsService;
  private AwsService() {}
  public static getInstance(): AwsService {
    if (!this.instance) {
      return new AwsService();
    }
    return this.instance;
  }

  public async getPreSignedUrl(key: string) {
    try {
      const getObjectParams = {
        Bucket: process.env.AWS_BUCKET,
        Key: key,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(client, command);
      return url;
    } catch (e) {
        console.log(e);
    }
  }

  public async upload(file_name: string,file_buffer:Buffer){
    try{
        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET as string,
            Key: `__output/${file_name}`,
            Body: file_buffer,
        });
        await client.send(putObjectCommand);
    }catch(e){
        console.log(e);
    }
}

  public async getPutPresignedUrl(contentType: string, name: string,Body:string) {
    try {
      console.log(process.env.AWS_BUCKET);
      const key = `__output/${name}`;
      const putObjectParams = {
        Bucket: process.env.AWS_BUCKET as string,
        Key: key,
        ContentType: contentType,
        Body: fs.createReadStream(Body)
      };
      const command = new PutObjectCommand(putObjectParams);
      await client.send(command);
      const url = await getSignedUrl(client, command);
      return url;
    } catch (e) {
      console.log(e);
      throw new Error("Unable to Upload file");
    }
  }
}
