"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

type Props = {};

export default function Room({}: Props) {
  const [userStream, setUserStream] = useState<MediaStream>();

  const callerUser = async () => {
    const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setUserStream(stream);
  };

  return (
    <div className="player-wrapper">
      <ReactPlayer
        className="react-player"
        url= {userStream}
        controls={true}
        width="1280px"
        height="720px"
      />
      <button
        type="button"
        onClick={callerUser}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 m-10"
      >
        Stream
      </button>
    </div>
  );
}
