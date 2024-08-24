import { Response, Request } from "express";
import { AwsService } from "../utils/AwsManager";

export const upload_controller = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if(!file){
      return res.status(400).json({message: "No file provided to upload"});
    }
    const file_name: string = file.originalname;
    const file_buffer: Buffer = file.buffer;
    await AwsService.getInstance().upload(file_name,file_buffer);
    return res.status(200).json({
      message: "File Uploaded Successfully"
    })
  } catch (e) {
    console.log("Error uploading file:");
    res.status(404).json({
      message: "File could not be uploaded!"
    });
  }
};
