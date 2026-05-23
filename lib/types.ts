export type Wedding = {
  id: string
  created_at: string
  planner_id: string
  name: string
  date: string | null
  venue: string | null
  description: string | null
  couple_names: string
  invite_code: string
}

export type WeddingMember = {
  id: string
  created_at: string
  wedding_id: string
  user_id: string
  display_name: string
  rsvp: 'yes' | 'no' | 'maybe' | 'pending'
}

export type Task = {
  id: string
  created_at: string
  wedding_id: string
  created_by: string | null
  title: string
  description: string | null
  category: TaskCategory
  status: 'open' | 'claimed' | 'done'
  claimed_by: string | null
  claimed_at: string | null
}

export type Offer = {
  id: string
  created_at: string
  wedding_id: string
  user_id: string
  display_name: string
  title: string
  description: string | null
  category: TaskCategory
  status: 'pending' | 'accepted' | 'declined'
}

export type AppNotification = {
  id: string
  created_at: string
  wedding_id: string
  type: string
  message: string
  read: boolean
}

export type TaskComment = {
  id: string
  created_at: string
  task_id: string
  wedding_id: string
  user_id: string
  display_name: string
  message: string
}

export type TaskCategory =
  | 'setup'
  | 'food'
  | 'music'
  | 'photography'
  | 'decor'
  | 'transport'
  | 'accommodation'
  | 'skill'
  | 'equipment'
  | 'other'
