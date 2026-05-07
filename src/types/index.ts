export type PostType = 'music' | 'movie' | 'article' | 'photo' | 'thought'

export interface Post {
  id: string
  type: PostType
  title: string
  sub?: string
  note: string
  sender: string
  url?: string
  image_url?: string
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
    accent: '#c9a96e',
    subPlaceholder: 'director / year',
    urlPrompt: 'view',
  },
  article: {
    label: 'article',
    icon: '✦',
    description: 'share an article',
    accent: '#7a9ec4',
    subPlaceholder: 'author / publication',
    urlPrompt: 'read',
  },
  photo: {
    label: 'photo',
    icon: '◎',
    description: 'share a photo',
    accent: '#b07aa0',
    subPlaceholder: 'caption (optional)',
    urlPrompt: '',
  },
  thought: {
    label: 'thought',
    icon: '○',
    description: 'share a thought',
    accent: '#9eb4c4',
    subPlaceholder: 'caption (optional)',
    urlPrompt: '',
  },
} as const

export interface Reply {
  id: string
  post_id: string
  author: string
  text: string
  created_at: string
}
