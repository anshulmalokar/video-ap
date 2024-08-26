import { Request,Response } from "express";
import { AwsService } from "../utils/AwsService";

export const getPreSignedUrl = async(req: Request,res: Response) => {
    try{
        const key = req.query.key as string;
        const _instance = AwsService.getInstance();
        const preSignedUrl = await _instance.getPreSignedUrl(key);
        return res.status(200).json({
            url: preSignedUrl
        })
    }catch(e){
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}