export interface EmotionPost {
  id: string
  content: string
  emotion: EmotionType
  timestamp: Date | string
  isAnonymous: boolean
  author?: string | null
  tags?: string[]
  userId?: string
  likes: number
  comments: Comment[]
  liked?: boolean
  isHidden?: boolean
  isReported?: boolean
  reportedBy?: string | null
  moderatedAt?: Date | string | null
}

export interface Comment {
  id: string
  content: string
  timestamp: Date | string
  isAnonymous: boolean
  author?: string | null
  isReported?: boolean
  reportedBy?: string | null
  postId: string
}

export type EmotionType = 'happy' | 'sad' | 'angry' | 'anxious' | 'excited' | 'frustrated' | 'grateful' | 'neutral'

export interface EmotionStats {
  total: number
  byType: Record<EmotionType, number>
  recentActivity: number
}

export interface CreatePostData {
  content: string
  emotion: EmotionType
  isAnonymous: boolean
  tags?: string[]
  author?: string | null
}

export interface CreateCommentData {
  postId: string
  content: string
  isAnonymous: boolean
  author?: string | null
}

export interface FilterOptions {
  emotion?: EmotionType
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
  sortBy?: 'timestamp' | 'likes' | 'comments'
  sortOrder?: 'asc' | 'desc'
}
