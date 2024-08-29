import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import fs from "fs";
import dotenv from "dotenv";
import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import path from "path";
import { S3ReadStream } from "s3-readstream";
dotenv.config();
ffmpeg.setFfmpegPath(ffmpegStatic as string);

const clientParams = {
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
};
const client = new S3Client(clientParams);

const convertToHLS = async (file_name: string) => {
  // First we need to copy the file from s3 bucket to local and then play around
  // With this file
  const mp4FileName = file_name;
  console.log("Downloading s3 mp4 file locally");
  const mp4FilePath = `${file_name}`;
  const writeStream = fs.createWriteStream("local.mp4");
  const params = {
    Bucket: process.env.AWS_BUCKET as string,
    Key: mp4FilePath,
  };
  const headObjectCommand = new HeadObjectCommand(params);
  const headObject = await client.send(headObjectCommand);
  const options = {
    s3: client,
    command: new GetObjectCommand(params),
    maxLength: headObject.ContentLength as number,
  };
  const readStream = new S3ReadStream(options);
  console.log("mod 2");
  readStream.pipe(writeStream);
  await new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });
  console.log("Downloaded s3 mp4 file locally");

  const resolutions = [
    {
      resolution: "320x180",
      videoBitrate: "500k",
      audioBitrate: "64k",
    },
    {
      resolution: "854x480",
      videoBitrate: "1000k",
      audioBitrate: "128k",
    },
    {
      resolution: "1280x720",
      videoBitrate: "2500k",
      audioBitrate: "192k",
    },
  ];

  const variantPlaylists = [];
  const promises = [];
  try {
    if (!fs.existsSync("output")) {
      fs.mkdirSync("output");
    }
  } catch (err) {
    console.error(err);
  }
  for (const { resolution, videoBitrate, audioBitrate } of resolutions) {
    console.log(`HLS conversion starting for ${resolution}`);
    const outputFileName = `${mp4FileName.replace(
      ".",
      "_"
    )}_${resolution}.m3u8`;
    const segmentFileName = `${mp4FileName.replace(
      ".",
      "_"
    )}_${resolution}_%03d.ts`;
    const promise = new Promise((resolve, reject) => {
      ffmpeg("./local.mp4")
        .outputOptions([
          `-c:v h264`,
          `-b:v ${videoBitrate}`,
          `-c:a aac`,
          `-b:a ${audioBitrate}`,
          `-vf scale=${resolution}`,
          `-f hls`,
          `-hls_time 10`,
          `-hls_list_size 0`,
          `-hls_segment_filename output/${segmentFileName}`,
        ])
        .output(`output/${outputFileName}`)
        .on("end", (msg) => resolve(msg))
        .on("error", (err) => reject(err))
        .run();
    });
    const variantPlaylist = {
      resolution,
      outputFileName,
    };
    variantPlaylists.push(variantPlaylist);
    promises.push(promise);
  }
  await Promise.all(promises);
  console.log("Done conversion for all resolutions");
  console.log(`HLS master m3u8 playlist generating`);
  let masterPlaylist = variantPlaylists
    .map((variantPlaylist) => {
      const { resolution, outputFileName } = variantPlaylist;
      const bandwidth =
        resolution === "320x180"
          ? 676800
          : resolution === "854x480"
          ? 1353600
          : 3230400;
      return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${outputFileName}`;
    })
    .join("\n");
  masterPlaylist = `#EXTM3U\n` + masterPlaylist;

  const masterPlaylistFileName = `${mp4FileName.replace(".", "_")}_master.m3u8`;
  const masterPlaylistPath = `output/${masterPlaylistFileName}`;
  fs.writeFileSync(masterPlaylistPath, masterPlaylist);
  console.log(`HLS master m3u8 playlist generated`);
  fs.unlinkSync("./local.mp4");
  console.log("Deleted thr locally downloaded local.mp4 file");
  const files = fs.readdirSync("output");
  for (const file of files) {
    if (!file.startsWith(file_name.replace(".", "_"))) {
      continue;
    }
    const file_path = path.join("output", file);
    const file_stream = fs.createReadStream(file_path);
    console.log("Uploading ", file, " to s3");
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET as string,
      Key: `output/${getFilenameWithoutExtension(file_name)}/${file}`,
      Body: file_stream,
      ContentType: (file.endsWith(".ts")
        ? "video/mp2t"
        : file.endsWith(".m3u8")
        ? "application/x-mpegURL"
        : null) as string,
    };
    await client.send(new PutObjectCommand(uploadParams));
    fs.unlinkSync(file_path);
  }
  console.log("Folder is successfully uploaded to s3");
};

function getFilenameWithoutExtension(filePath: string): string {
    return path.basename(filePath, path.extname(filePath));
}

export default convertToHLS;