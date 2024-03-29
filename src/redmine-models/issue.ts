type IdName = {
  id: number
  name: string
}

export class Issue {
  id: number = 0
  project: IdName = { id: 0, name: '' }
  tracker: IdName = { id: 0, name: '' }
  status: IdName = { id: 0, name: '' }
  priority: IdName = { id: 0, name: '' }
  author: IdName = { id: 0, name: '' }
  subject: string = ''
  description: string = ''
  start_date?: Date = new Date()
  due_date?: Date = new Date()
  done_ratio: number = 0
  is_private: boolean = false
  estimated_hours?: number = 0
  total_estimated_hours?: number = 0
  spent_hours: number = 0
  total_spent_hours: number = 0
  custom_fields: {
    id: number
    name: string
    value: string
  }[] = []
  created_on: Date = new Date()
  updated_on: Date = new Date()
  closed_on?: Date = new Date()
}
