import express from "express";
import { Request,Response } from "express";
import prisma from "../db";

export const uploadToDb = async (req: Request,res: Response) => {
    try{
        const title = req.body.title;
        const description = req.body.description;
        const author = req.body.author;
        const url = req.body.url;
        await prisma.videoData.create({
            data:{
                title,
                description,
                author,
                url
            }
        });
        return res.status(200).json({
            message: "Video Data Uploaded Successfully"
        })
    }catch(e){
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}