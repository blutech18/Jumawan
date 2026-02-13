import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Project {
  id: string
  title: string
  description: string
  image_url?: string
  live_url?: string
  github_url?: string
  technologies: string[]
  featured: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface Certificate {
  id: string
  title: string
  issuer: string
  issue_date: string
  credential_id?: string
  credential_url?: string
  image_url?: string
  description?: string
  order_index: number
  type?: 'participation' | 'recognition'
  created_at: string
  updated_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  created_at: string
  updated_at: string
}

export interface Analytics {
  id: string
  event_type: string
  event_data?: any
  user_agent?: string
  ip_address?: string
  referrer?: string
  page_url?: string
  created_at: string
}

export interface WorkExperience {
  id: string
  company: string
  position: string
  type: 'Full-time' | 'Part-time' | 'Freelance' | 'Internship' | 'Contract'
  location: string
  start_date: string
  end_date?: string
  current: boolean
  duration?: string
  achievements: string[]
  responsibilities: string[]
  technologies: string[]
  team_size?: string
  company_size?: string
  order_index: number
  created_at: string
  updated_at: string
}