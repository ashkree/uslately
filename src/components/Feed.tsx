import { useEffect, useState, useCallback } from 'react'
import Card from './Card'
import ShareFAB from './ShareFab'
import { supabase } from '../lib/supabase'
import type { Post } from '../types'

export interface FeedProps {
  currentUser: string
  onSignOut: () => void
}

const postsCache = new Map<string, Post>()

export default function Feed({ currentUser, onSignOut }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reloadFeed = useCallback(async () => {
    const cachedPosts = Array.from(postsCache.values())
    const lastCreatedAt =
      cachedPosts.length > 0
        ? cachedPosts.reduce(
            (latest, post) =>
              new Date(post.created_at) > new Date(latest) ? post.created_at : latest,
            cachedPosts[0].created_at,
          )
        : null

    let query = supabase.from('posts').select('*')

    if (lastCreatedAt) {
      query = query.gt('created_at', lastCreatedAt)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      return
    }

    const newPosts = data as Post[]
    newPosts.forEach((post) => postsCache.set(post.id, post))

    const allCachedPosts = Array.from(postsCache.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

    setPosts(allCachedPosts)
  }, [])

  useEffect(() => {
    async function loadPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        const loadedPosts = data as Post[]
        loadedPosts.forEach((post) => postsCache.set(post.id, post))
        setPosts(loadedPosts)
      }
      setLoading(false)
    }

    loadPosts()
  }, [])

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between border-b border-[#e0c8d8] pb-4'>
        <h1 className="font-['Cormorant_Garamond'] italic text-3xl text-[#3d2435]">us, lately</h1>
        <button
          onClick={onSignOut}
          className="font-['Cormorant_Garamond'] text-sm italic text-[#c9a8c0] hover:text-[#a07090] transition-colors"
        >
          sign out
        </button>
      </div>

      {loading && <p className='text-[#a07090]'>Loading...</p>}
      {error && <p className='text-red-500'>{error}</p>}

      {!loading &&
        !error &&
        posts.map((post) => <Card key={post.id} post={post} currentUser={currentUser} />)}

      <ShareFAB currentUser={currentUser} onShareSuccess={reloadFeed} />
    </div>
  )
}
