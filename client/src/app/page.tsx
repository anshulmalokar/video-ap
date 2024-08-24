import Auth from "./_pages/auth";
import Room from "./_pages/room";
import Upload from "./_pages/upload";
export default function Home() {
  return (
    <>
       <div className='player-wrapper'>
        <Auth/>
      </div>
    </>
  );
}
