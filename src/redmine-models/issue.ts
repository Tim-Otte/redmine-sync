type IdName = {
  id: number
  name: string
}

export type Issue = {
  id: number
  project: IdName
  tracker: IdName
  status: IdName
  priority: IdName
  author: IdName
  subject: string
  description: string
  start_date?: Date
  due_date?: Date
  done_ratio: number
  is_private: boolean
  estimated_hours?: number
  total_estimated_hours?: number
  spent_hours: number
  total_spent_hours: number
  custom_fields: {
    id: number
    name: string
    value: string
  }[]
  created_on: Date
  updated_on: Date
  closed_on?: Date
}
