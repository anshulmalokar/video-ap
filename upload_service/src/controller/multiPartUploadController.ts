import { Request, Response } from "express";
import { AwsService } from "../utils/AwsManager";
import path from "path";

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

export const startMultiPartUpload = async (req: Request, res: Response) => {
  try {
    const { filename,key } = req.body;
    const upload_id = await AwsService.getInstance().getMultiPartUploadId(
      filename,
      key
    );
    return res.status(200).json({
      id: upload_id,
      key: filename,
    });
  } catch (e) {
    return res.status(500).json({
      message: "Some Internal error occured",
    });
  }
};

export const uploadChunkController = async (req: Request, res: Response) => {
  try {
    const id = req.body.id;
    const key = req.body.key;
    const part_number = req.body.part_number;
    const chunk = req.file?.buffer;
    console.log({
      id,
      key,
      part_number,
    });
    const _instance = AwsService.getInstance();
    const data = await _instance.uploadChunk(
      id,
      key,
      part_number,
      chunk as Buffer
    );
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({
      message: "Some Internal error occured",
    });
  }
};

export const completeMultipartUpload = async (req: Request, res: Response) => {
  try {
    const key = req.body.key;
    const id = req.body.id;
    const uploaded_tags = req.body.uploaded_tags;
    const _instance = AwsService.getInstance();
    console.log({
      key,
      id,
      uploaded_tags,
    });
    const data = await _instance.completeMultipartUpload(
      id,
      key,
      uploaded_tags
    );
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({
      message: "Some Internal error occured",
    });
  }
};
