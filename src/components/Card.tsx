export default function Card() {
  return (
    <div className='border-2 border-[#e0c8d8] bg-[#fffaf8] shadow-md p-6 rounded-lg flex flex-col gap-5'>
      <div>
        <span className='text-sm text-[#a07090] italic'>music · Him · Today</span>
        <h2 className='text-2xl text-medium text-[#3d2435] '> Song Name </h2>

        <p className='text-sm text-[#7a5c72]'>Artist Name</p>
      </div>
      <div>
        <p className='text-base italic text-[#3d2435]'>"A good song I heard recently"</p>
      </div>
    </div>
  )
}
