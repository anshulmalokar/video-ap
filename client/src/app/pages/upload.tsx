import React from "react";
import UploadForm from "../_components/uploadFrom";

type Props = {};

export default function Upload({}: Props) {
  return (
    <div className="m-10">
      <h1>HHLD YouTube - Upload Page</h1>
      <UploadForm />
    </div>
  );
}
