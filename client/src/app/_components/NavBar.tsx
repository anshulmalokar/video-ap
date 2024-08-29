import React from 'react'
import Auth from '../_pages/auth'
import { useSession } from 'next-auth/react'
type Props = {}

export default function NavBar({}: Props) {
  
 return (
    <>
     <div className='top-0 flex justify-between items-center bg-red-400'>
        <div className='flex justify-center items-center'>
            <h1 className='text-3xl font-bold p-6'>Logo</h1>
            <h3>Streaming Application</h3>
        </div>
        <Auth/>
     </div>
    </>
  )
}