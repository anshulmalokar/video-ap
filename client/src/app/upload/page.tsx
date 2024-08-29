import React from 'react'
import Upload from '../_pages/upload'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
type Props = {}
const {data} = useSession();
const router = useRouter();
if(!data){
  router.push("/");
}
export default function page({}: Props) {
  return (
    <>
      <Upload/>
    </>
  )
}