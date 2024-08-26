import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
  } from "@aws-sdk/client-s3";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  import dotenv from "dotenv";
  import fs from "fs";
  import AWS from "aws-sdk";
  import ms from "mime-types";
  
  dotenv.config();
  
  const clientParams = {
    region: "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  };
  
  AWS.config.update(clientParams);
  const s3 = new AWS.S3();
  
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
  
    public async getMultiPartUploadId(file: string){
      try{
        const multi_parts_uppload_params = {
          Bucket: process.env.AWS_BUCKET as string,
          Key: `__output/${file}`,
          // ACL: "public-read",
          ContentType: ms.lookup(file as unknown as string) as string,
        };
    
        const multiPartParams = await s3
            .createMultipartUpload(multi_parts_uppload_params)
            .promise();
    
        return multiPartParams.UploadId;
      }catch(e){
        console.log(e);
        throw new Error();
      }
    }
  
    public async uploadChunk(id: string,key: string,part_number: number,chunk: Buffer){
      try{
        const part_params = {
          Bucket: process.env.AWS_BUCKET as string,
          Key: key as string,
          UploadId: id as string,
          PartNumber: part_number as number,
          Body: chunk,
          ContentLength: chunk.length,
        };
        const data = await s3.uploadPart(part_params).promise();
        console.log(`Uploaded part ${part_number}: ${data.ETag}`);
        return {
          ETag: data.ETag,
          PartNumber: part_number,
        }   
      }catch(e){
        console.log(e);
        throw new Error();
      }
    }
  
    public async completeMultipartUpload(key: string,id: string,uploaded_tags: []){
      try{
        const completeParams = {
          Bucket: process.env.AWS_BUCKET as string,
          Key: key as string,
          UploadId: id as string,
          MultipartUpload: { Parts: uploaded_tags },
        };
        console.log("Completing MultiPart Upload");
        const completeRes = await s3
          .completeMultipartUpload(completeParams)
          .promise();
        return completeRes.ETag;
      }catch(e){
        console.log(e);
        throw new Error();
      }   
    }
  
    public async multiPartUpload(file_path: string) {
      const multi_parts_uppload_params = {
        Bucket: process.env.AWS_BUCKET as string,
        Key: "trial-key",
        // ACL: "public-read",
        ContentType: ms.lookup(file_path as unknown as string) as string,
      };
  
      try {
        console.log("Starting the process of multi_part_upload");
        const multiPartParams = await s3
          .createMultipartUpload(multi_parts_uppload_params)
          .promise();
        const file_size = fs.statSync(file_path).size;
        const chunk_size = 5 * 1024 * 1024;
        const chunk_count = Math.ceil(file_size / chunk_size);
        const uploaded_tags = [];
        for (let i = 0; i < chunk_count; i++) {
          const start = i * chunk_count;
          const end = Math.min(start + chunk_size, file_size);
          const part_params = {
            Bucket: multi_parts_uppload_params.Bucket,
            Key: multi_parts_uppload_params.Key as string,
            UploadId: multiPartParams.UploadId as string,
            PartNumber: i + 1,
            Body: fs.createReadStream(file_path, { start, end }),
            ContentLength: end - start,
          };
          const data = await s3.uploadPart(part_params).promise();
          console.log(`Uploaded part ${i + 1}: ${data.ETag}`);
          uploaded_tags.push({
            ETag: data.ETag,
            PartNumber: i + 1,
          });
        }
  
        const completeParams = {
          Bucket: multi_parts_uppload_params.Bucket as string,
          Key: multi_parts_uppload_params.Key as string,
          UploadId: multiPartParams.UploadId as string,
          MultipartUpload: { Parts: uploaded_tags },
        };
  
        console.log("Completing MultiPart Upload");
        const completeRes = await s3
          .completeMultipartUpload(completeParams)
          .promise();
        console.log(completeRes);
      } catch (e) {
        console.log(e);
        throw new Error("");
      }
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
  
    public async upload(file_name: string, file_buffer: Buffer) {
      try {
        const putObjectCommand = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET as string,
          Key: `__output/${file_name}`,
          Body: file_buffer,
        });
        await client.send(putObjectCommand);
      } catch (e) {
        console.log(e);
      }
    }
  
    public async getPutPresignedUrl(
      contentType: string,
      name: string,
      Body: string
    ) {
      try {
        console.log(process.env.AWS_BUCKET);
        const key = `__output/${name}`;
        const putObjectParams = {
          Bucket: process.env.AWS_BUCKET as string,
          Key: key,
          ContentType: contentType,
          Body: fs.createReadStream(Body),
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
  