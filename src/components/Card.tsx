import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { TYPE_CONFIG, type Post, type Reply } from '../types'

interface CardProps {
  post: Post
  currentUser: string
}

export default function Card({ post, currentUser }: CardProps) {
  const [reply, setReply] = useState<Reply | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loadingReply, setLoadingReply] = useState(true)

  const date = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  const cfg = TYPE_CONFIG[post.type]

  const canReply = currentUser !== post.sender && !reply

  const fetchReply = useCallback(async () => {
    const { data } = await supabase
      .from('replies')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    setReply(data ?? null)
    setLoadingReply(false)
  }, [post.id])

  useEffect(() => {
    fetchReply()
  }, [fetchReply])

  useEffect(() => {
    const channel = supabase
      .channel(`replies-${post.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'replies', filter: `post_id=eq.${post.id}` },
        () => fetchReply(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [post.id, fetchReply])

  const handleSubmitReply = async () => {
    if (!replyText.trim() || submitting) return
    setSubmitting(true)

    const { data, error } = await supabase
      .from('replies')
      .insert({ post_id: post.id, author: currentUser, text: replyText.trim() })
      .select()
      .single()

    setSubmitting(false)
    if (!error && data) {
      setReply(data as Reply)
      setReplyText('')
    }
  }

  return (
    <div className='border-2 border-[#e0c8d8] bg-[#fffaf8] shadow-md p-6 rounded-lg flex flex-col gap-5'>
      {/* Header */}
      <div>
        <span className='text-sm text-[#a07090] italic'>
          {post.type} · {post.sender} · {date}
        </span>

        {post.type !== 'thought' && post.title && (
          <h2 className='text-2xl text-medium text-[#3d2435]'>{post.title}</h2>
        )}

        {post.type !== 'thought' && post.sub && <p className='text-sm text-[#7a5c72]'>{post.sub}</p>}
      </div>

      {/* Photo image */}
      {post.type === 'photo' && post.image_url && (
        <img
          src={post.image_url}
          alt={post.title || 'shared photo'}
          className='w-full max-h-72 rounded-lg object-cover border border-[#e0c8d8]'
        />
      )}

      {/* Note */}
      <div>
        <p className='text-base italic text-[#3d2435]'>"{post.note}"</p>
      </div>

      {/* Link */}
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

      {/* Replies section */}
      {!loadingReply && (
        <div className='border-t border-[#e0c8d8] pt-4 flex flex-col gap-3'>
          {reply ? (
            /* Existing reply */
            <div className='flex gap-2.5 items-start'>
              <span className="font-['DM_Sans'] text-xs uppercase tracking-widest text-[#a07090] pt-0.5 shrink-0">
                {reply.author}
              </span>
              <p className="font-['Cormorant_Garamond'] text-base italic text-[#7a5c72] leading-snug">
                "{reply.text}"
              </p>
            </div>
          ) : canReply ? (
            /* Reply input — only shown to the non-sender */
            <div className='flex gap-2 items-end'>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitReply()
                  }
                }}
                placeholder='leave a note…'
                rows={1}
                className="flex-1 resize-none rounded-lg border border-[#d9b8d3] bg-white px-3 py-2 font-['DM_Sans'] text-sm text-[#3d2435] outline-none focus:border-[#b07aa0] transition-colors placeholder:text-[#c9a8c0]"
              />
              <button
                onClick={handleSubmitReply}
                disabled={submitting || !replyText.trim()}
                className="rounded-lg bg-[#b07aa0] px-3 py-2 font-['Cormorant_Garamond'] text-sm italic text-white transition-opacity hover:bg-[#9c6a8d] disabled:opacity-40 shrink-0"
              >
                {submitting ? '…' : 'send'}
              </button>
            </div>
          ) : (
            /* Sender's view when no reply yet */
            <p className="font-['DM_Sans'] text-xs italic text-[#c9a8c0]">no reply yet…</p>
          )}
        </div>
      )}
    </div>
  )
}
