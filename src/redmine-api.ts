import { HttpClient, HttpCodes } from '@actions/http-client'
import { MyAccount } from './redmine-models/my-account'
import { Issue } from './redmine-models/issue'

export class RedmineApi {
  private url: string
  private apiKey: string

  constructor(url: string, apiKey: string) {
    this.url = url.endsWith('/') ? url.substring(0, url.length - 1) : url
    this.apiKey = apiKey
  }

  private getApiUrl(
    path: string,
    params?: { key: string; value: string }[]
  ): string {
    if (params == undefined) params = []
    params.push({ key: 'key', value: this.apiKey })
    return `${this.url}/${path}?${params.map(p => `${p.key}=${p.value}`).join('&')}`
  }

  public async myAccount(): Promise<MyAccount> {
    const httpClient = new HttpClient()
    const response = await httpClient.getJson<MyAccount>(
      this.getApiUrl('/my/account.json')
    )

    if (response.statusCode == HttpCodes.OK && response.result != null)
      return response.result
    else throw new Error('Error while fetching account info')
  }

  public async getIssue(number: number): Promise<Issue | null> {
    const httpClient = new HttpClient()
    const response = await httpClient.getJson<Issue>(
      this.getApiUrl(`/issues/${number}.json`)
    )

    if (response.statusCode == HttpCodes.OK) return response.result
    else if (response.statusCode == HttpCodes.NotFound) return null
    else throw new Error(`Error while fetching issue ${number}`)
  }
}
