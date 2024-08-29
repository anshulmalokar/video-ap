import { Request,Response } from "express";
import { AwsService } from "../utils/AwsService";
import prisma from "../db";
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

export const fetchVideos = async (req: Request,res: Response) => {
    try{
        const data = await prisma.videoData.findMany({});
        return res.status(200).json({
            data
        });
    }catch(e){
        return res.status(200).json({
            message: "Internal Server Error"
        })
    }
}