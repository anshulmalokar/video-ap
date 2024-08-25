import { Request,Response } from "express";
import { AwsService } from "../utils/AwsManager";
import path from "path";

export const doMultiPartUpload = async (req: Request,res: Response) => {
    try{
        const _instance = AwsService.getInstance();
        const file_path = path.join(__dirname,"../../uploads/File.MOV");
        await _instance.multiPartUpload(file_path);
        return res.status(200).json({
            message: "File has been uploaded successfully"
        });
    }catch(e){
        return res.status(500).json({
            message: "Some Internal error occured while doing the multipart upload"
        });
    }
}