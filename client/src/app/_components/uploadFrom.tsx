"use client";
import React, { useState } from "react";
import axios from "axios";
type Props = {};

export default function UploadForm({}: Props) {
  const [file, setFile] = useState<FileList | null>(null);

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData: FormData = new FormData();
    if(file){
        formData.append('file',file[0]);
        const response = await axios.post("http://localhost:8000/upload",formData,{
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        });
        if(response.data.message !== 'File Uploaded Successfully'){
            alert(response.data.message);
        }
        alert(response.data.message);
    }else{
      alert('Please select a file');
    }
  }

  return (
    <form onSubmit={(e) => {submitForm(e)}}>
      <input type="file" onChange={(e) => setFile(e.target.files)}/>
      <button className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
        Upload
      </button>
    </form>
  );
}
