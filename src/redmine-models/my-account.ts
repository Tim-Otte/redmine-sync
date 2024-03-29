export class MyAccount {
  id: number = 0
  login: string = ''
  admin: boolean = false
  firstname: string = ''
  lastname: string = ''
  mail: string = ''
  created_on: Date = new Date()
  last_login_on: Date = new Date()
  api_key: string = ''
  custom_fields: {
    id: number
    name: string
    value: string
  }[] = []
}
