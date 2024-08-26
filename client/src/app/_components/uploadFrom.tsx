"use client";
import React, { useState } from "react";
import axios from "axios";
type Props = {};

export default function UploadForm({}: Props) {
  const [file, setFile] = useState<FileList | null>();

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
      console.log(filename);
      const response_1 = await axios.post(
        "http://localhost:8000/upload/getUplloadMultipartId",
        {
          filename,
          key
        }
      );
      const id = response_1.data.id;
      console.log(id);
      // Do uploads for chunks
      const chunk_size = 1024 * 1024 * 20;
      const file_size = file[0].size;
      const totalChunks = Math.ceil(file_size / chunk_size);
      const promises = [];
      const response_chunk_data: {
        ETag: string;
        PartNumber: number;
      }[] = [];
      let start = 0;
      console.log("The Chunk Count is :", totalChunks);
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const chunk = file[0].slice(start, start + chunk_size);
        start += chunk_size;
        const formData = new FormData();
        formData.append("chunk", chunk);
        formData.append("id", id);
        formData.append("key", key);
        formData.append("part_number", `${chunkIndex + 1}`);
        const promise = axios.post(
          "http://localhost:8000/upload/uploadChunk",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        promises.push(promise);
      }
      const response = await Promise.all(promises);
      response.forEach((response) => {
        const x = response.data;
        const y = {
          ETag: x.ETag.replace(/"/g, '') as string,
          PartNumber: parseInt(x.PartNumber as string) as number,
        }
        response_chunk_data.push(y);
      });
      // Call the api for completing the multi-part upload
      const response_2 = await axios.post(
        "http://localhost:8000/upload/uploadComplete",
        {
          key,
          id,
          uploaded_tags: response_chunk_data,
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
