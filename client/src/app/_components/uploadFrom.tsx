"use client";
import React, { useState } from "react";
import axios from "axios";
type Props = {};

export default function UploadForm({}: Props) {
  const [file, setFile] = useState<FileList | null>();

  async function uploadPart(
    fileChunk: Blob,
    presignedUrl: string,
    partNo: number
  ) {
    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      body: fileChunk,
    });

    return {
      value: { ETag: uploadResponse.headers.get("ETag") ?? "", PartNo: partNo },
    };
  }

  // const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   const formData: FormData = new FormData();
  //   if(file){
  //       formData.append('file',file[0]);
  //       const response = await axios.post("http://localhost:8000/upload/multipart",formData,{
  //           headers: {
  //             'Content-Type': 'multipart/form-data'
  //           }
  //       });
  //       if(response.data.message !== 'File Uploaded Successfully'){
  //           alert(response.data.message);
  //       }
  //       alert(response.data.message);
  //   }else{
  //     alert('Please select a file');
  //   }
  // }

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (file) {
      const filename = file[0].name;
      const key = filename;
      const response_1 = await axios.post(
        "http://localhost:8000/upload/beginMultiPartUpload",
        {
          key,
        }
      );
      const uploadId = response_1.data.uploadId;
      // Do uploads for chunks
      const chunk_size = 1024 * 1024 * 20;
      const file_size = file[0].size;
      const totalChunks = Math.ceil(file_size / chunk_size);
      const response_chunk_data: {
        ETag: string;
        PartNo: number;
      }[] = [];
      const preSignedUrls = [];
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const response_2 = await axios.post(
          "http://localhost:8000/upload/getPartPreSignedUrl",
          {
            key,
            uploadId,
            partNumber: chunkIndex + 1,
          }
        );
        const preSignedUrl = await response_2.data.url;
        preSignedUrls.push(preSignedUrl);
      }
      const uploadArray = [];
      let start = 0;
      for(let chunkIndex = 0; chunkIndex < totalChunks ; chunkIndex++){
        const chunk = file[0].slice(start,start + chunk_size);
        start += chunk_size;
        uploadArray.push(uploadPart(chunk,preSignedUrls[chunkIndex],chunkIndex+1));
      }
      const uploadResponses = await Promise.all(uploadArray);
      uploadResponses.map(u => {
        response_chunk_data.push(u.value);
      })
      // Call the api for completing the multi-part upload
      const response_2 = await axios.post(
        "http://localhost:8000/upload/uploadComplete",
        {
          key,
          uploadId,
          uploadedTags: response_chunk_data,
        }
      );
    } else {
      alert("Please select a file");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        submitForm(e);
      }}
    >
      <input type="file" onChange={(e) => setFile(e.target.files)} />
      <button className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
        Upload
      </button>
    </form>
  );
}
