import { TYPE_CONFIG, type Post } from '../types'

interface CardProps {
  post: Post
}

export default function Card({ post }: CardProps) {
  const date = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  const cfg = TYPE_CONFIG[post.type]

  return (
    <div className='border-2 border-[#e0c8d8] bg-[#fffaf8] shadow-md p-6 rounded-lg flex flex-col gap-5'>
      <div>
        <span className='text-sm text-[#a07090] italic'>
          {post.type} · {post.sender} · {date}
        </span>

        <h2 className='text-2xl text-medium text-[#3d2435]'>{post.title}</h2>

        {post.sub && <p className='text-sm text-[#7a5c72]'>{post.sub}</p>}
      </div>

      {/* Photo image - only shown for photo posts */}
      {post.type === 'photo' && post.image_url && (
        <img
          src={post.image_url}
          alt={post.title || 'shared photo'}
          className='w-full max-h-72 rounded-lg object-cover border border-[#e0c8d8]'
        />
      )}

      <div>
        <p className='text-base italic text-[#3d2435]'>"{post.note}"</p>
      </div>

      {post.url && (
        <a
          href={post.url}
          target='_blank'
          rel='noopener noreferrer'
          className="font-['DM_Sans'] text-xs uppercase tracking-widest text-[#a07090] hover:text-[#b07aa0] transition-colors"
        >
          {cfg.urlPrompt} →
        </a>
      )}
    </div>
  )
}
