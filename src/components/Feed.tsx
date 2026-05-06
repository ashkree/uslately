import Card from './Card'
import ShareFAB from './ShareFab'

export default function Feed() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='border-b border-[#e0c8d8] pb-4'>
        <h1 className='italic text-3xl text-[#3d2435]'>Us, Lately</h1>
      </div>

      <Card />
      <Card />
      <Card />
      <Card />
      <ShareFAB currentUser={'Him'} />
    </div>
  )
}
