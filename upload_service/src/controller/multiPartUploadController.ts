import { Request, Response } from "express";
import { AwsService } from "../utils/AwsManager";
import path from "path";
import prisma from "../db";

export const doMultiPartUpload = async (req: Request, res: Response) => {
  try {
    const _instance = AwsService.getInstance();
    const file_path = path.join(__dirname, "../../uploads/File1.MOV");
    await _instance.multiPartUpload(file_path);
    return res.status(200).json({
      message: "File has been uploaded successfully",
    });
  } catch (e) {
    return res.status(500).json({
      message: "Some Internal error occured while doing the multipart upload",
    });
  }
};

// export const startMultiPartUpload = async (req: Request, res: Response) => {
//   try {
//     const { filename,key } = req.body;
//     const upload_id = await AwsService.getInstance().getMultiPartUploadId(
//       filename,
//       key
//     );
//     return res.status(200).json({
//       id: upload_id,
//       key: filename,
//     });
//   } catch (e) {
//     return res.status(500).json({
//       message: "Some Internal error occured",
//     });
//   }
// };

// export const uploadChunkController = async (req: Request, res: Response) => {
//   try {
//     const id = req.body.id;
//     const key = req.body.key;
//     const part_number = req.body.part_number;
//     const chunk:Buffer | undefined = req.file?.buffer;
//     if(!chunk){
//       return res.status(400).json({
//         message: "No valid chunk has been send"
//       });
//     }
//     const _instance = AwsService.getInstance();
//     const data = await _instance.uploadChunk(
//       id,
//       key,
//       part_number,
//       chunk
//     );
//     return res.status(200).json(data);
//   } catch (e) {
//     return res.status(500).json({
//       message: "Some Internal error occured",
//     });
//   }
// };

// export const completeMultipartUpload = async (req: Request, res: Response) => {
//   try {
//     const key = req.body.key;
//     const id = req.body.id;
//     const uploaded_tags = req.body.uploaded_tags;
//     const _instance = AwsService.getInstance();
//     const data = await _instance.completeMultipartUpload(
//       id,
//       key,
//       uploaded_tags
//     );
//     return res.status(200).json(data);
//   } catch (e) {
//     return res.status(500).json({
//       message: "Some Internal error occured",
//     });
//   }
// };

export const startMultiPartUpload = async (req: Request, res: Response) => {
  try {
    const key = req.body.key;
    const uploadId = await AwsService.getInstance().createMultiPartUpload(key);
    console.log(uploadId);
    return res.status(200).json({ uploadId });
  } catch (e) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getPreSignedUrlForPart = async (req: Request, res: Response) => {
  try {
    const key = req.body.key;
    const uploadId = req.body.uploadId;
    const partNumber = req.body.partNumber;
    const url =
      await AwsService.getInstance().generatePreSignedUrlForMultiPartUpload(
        key,
        uploadId,
        partNumber
      );
    return res.status(200).json({
      url,
    });
  } catch (e) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const completeMultipartUpload = async (req: Request, res: Response) => {
  try {
    const key = req.body.key;
    const uploadId = req.body.uploadId;
    const uploadedTags: {
      ETag: string;
      PartNo: number;
    }[] = req.body.uploadedTags;
    const title = req.body.title;
    const description = req.body.description;
    const author = req.body.author;
    const url: string =
      (await AwsService.getInstance().completeMultiPartUploadWithPreSignedUrl(
        key,
        uploadId,
        uploadedTags
      )) as unknown as string;
    await prisma.videoData.create({
      data: {
        title,
        description,
        author,
        url,
      },
    });
    return res.status(200).json({
      message: "Upload Completed Successfylly",
    });
  } catch (e) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
