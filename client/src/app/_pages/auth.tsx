"use client";
import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
type Props = {};

export default function Auth({}: Props) {
  const { data } = useSession();
  console.log(data);
  const router = useRouter();
  const signOutApp = () => {
    console.log("Signing out from google");
    signOut();
  };

  const signInApp = () => {
    console.log("Siggning in from google");
    signIn("google");
  };

  if(data){
    router.push('/upload')
  }
  
  return (
    <>
      <div className="m-10">
        <button
          type="submit"
          onClick={signInApp}
          className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Sign In
        </button>
        <button
          type="submit"
          onClick={signOutApp}
          className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Sign Out
        </button>
      </div>
    </>
  );
}
