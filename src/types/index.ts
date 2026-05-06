export type PostType = 'music' | 'movie' | 'article'

export interface Post {
  id: string
  type: PostType
  title: string
  sub?: string
  note: string
  sender: string
  url?: string
  created_at: string
}

export const TYPE_CONFIG = {
  music: {
    label: 'music',
    icon: '♪',
    description: 'share a song',
    accent: '#7eb8a4',
    subPlaceholder: 'artist',
    urlPrompt: 'listen',
  },
  movie: {
    label: 'movie',
    icon: '▶︎',
    description: 'share a movie',
    accent: '#7a9ec4',
    subPlaceholder: 'year',
    urlPrompt: 'watch',
  },
  article: {
    label: 'article',
    icon: '',
    description: 'share an article',
    accent: '#7a9ec4',
    subPlaceholder: 'author',
    urlPrompt: 'read',
  },
} as const

export interface Reply {
  id: string
  post_id: string
  author: string
  text: string
  created_at: string
}
