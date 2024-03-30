export type MyAccount = {
  id: number
  login: string
  admin: boolean
  firstname: string
  lastname: string
  mail: string
  created_on: Date
  last_login_on: Date
  api_key: string
  custom_fields: {
    id: number
    name: string
    value: string
  }[]
}
