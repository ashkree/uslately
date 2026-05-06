import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Post } from '../types'
import Card from './Card'
import ShareFAB from './ShareFAB'

interface FeedProps {
  currentUser: string
}

export default function Feed({ currentUser }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    console.log('posts:', data)
    console.log('error:', error)
    if (data) setPosts(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPosts()

    const channel = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchPosts])

  if (loading) return <div>loading...</div>

  return (
    <div className='flex flex-col gap-4'>
      <div className='border-b border-b-gray-400 pb-4'>
        <h1 className='italic text-3xl'>us, lately</h1>
      </div>

      {posts.map((post) => (
        <Card key={post.id} post={post} currentUser={currentUser} />
      ))}

      <ShareFAB currentUser={currentUser} />
    </div>
  )
}
