import { debug } from '@actions/core'
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

  /**
   * Creates an API url for the given `path` using the `params` as GET parameters
   * @param path The path of the REST API action (without leading slash '/')
   * @param params An array of GET url parameters
   * @returns The url to use for the API request
   */
  private getApiUrl(
    path: string,
    params?: { key: string; value: string }[]
  ): string {
    if (params === undefined) params = []
    params.push({ key: 'key', value: this.apiKey })
    const url = `${this.url}/${path}?${params.map(p => `${p.key}=${p.value}`).join('&')}`
    debug(`Generated Redmine API URL: ${url}`)
    return url
  }

  /**
   * Get the account info for the authorized user
   * @returns The account of the authorized user
   */
  async myAccount(): Promise<MyAccount> {
    const httpClient = new HttpClient()
    const response = await httpClient.getJson<MyAccount>(
      this.getApiUrl('my/account.json')
    )

    if (response.statusCode === HttpCodes.OK && response.result != null)
      return response.result
    else throw new Error('Error while fetching account info')
  }

  /**
   *
   * @param number The number of the issue to fetch
   * @returns Either the issue or `null` if the issue was not found
   */
  async getIssue(number: number): Promise<Issue | null> {
    const httpClient = new HttpClient()
    const response = await httpClient.getJson<Issue>(
      this.getApiUrl(`issues/${number}.json`)
    )

    if (response.statusCode === HttpCodes.OK) return response.result
    else if (response.statusCode === HttpCodes.NotFound) return null
    else throw new Error(`Error while fetching issue ${number}`)
  }

  /**
   * Get the API url without a slash '/' at the end
   * @returns The API url
   */
  getUrl(): string {
    return this.url
  }
}
