import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { RedmineApi } from './redmine-api'
import { HttpCodes } from '@actions/http-client'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
  try {
    let issueNumber: number | null = null
    let pullNumber: number | null = null

    if (context.eventName == 'pull_request') {
      core.debug(
        'This GitHub action has been started because a pull_request event has been triggered'
      )
      const result = /refs\/pull\/(\d+)\/merge/g.exec(context.ref)
      if (result != null) {
        const [, pullRequestIdText] = result
        pullNumber = parseInt(pullRequestIdText)
      }
    }

    if (pullNumber == null) {
      core.setFailed('Could not find the number of the pull request')
      return
    }

    const pullRequest = await getOctokit(
      core.getInput('GITHUB_TOKEN')
    ).rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pullNumber
    })

    if (pullRequest.status == HttpCodes.OK) {
      core.debug(
        `Found pull request ${pullRequest.data.id} with title '${pullRequest.data.title}'`
      )

      const result = /#(\d+)/g.exec(pullRequest.data.title)
      if (result != null) {
        const [, issueNumberText] = result[0]
        issueNumber = parseInt(issueNumberText)
      }
    }

    if (issueNumber == null) {
      core.info('Could not find ticket number. Exiting...')
      return
    }

    core.debug('Initializing Redmine API...')
    const redmineApi = new RedmineApi(
      core.getInput('redmine-url'),
      core.getInput('redmine-api_key')
    )

    core.debug(`Testing connection to redmine instance...`)
    try {
      const account = await redmineApi.myAccount()
      core.info(
        `Successfully connected to Redmine. Hi ${account.firstname} ${account.lastname}!`
      )

      if (account.admin)
        core.warning(
          'Its not recommended to use a Redmine admin account for this action'
        )
    } catch {
      throw new Error(
        'Could not connect to Redmine. Please check the url and the API key'
      )
    }

    // Fetching the infos for the issue
    const issue = await redmineApi.getIssue(issueNumber)
    if (issue == null) {
      core.info(`Could not find Redmine issue ${issueNumber}`)
    } else {
      const updateStatus = await getOctokit(
        core.getInput('GITHUB_TOKEN')
      ).rest.pulls.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: pullNumber,
        title: `#${issueNumber} ${issue.subject}`,
        body: issue.description
      })

      if (updateStatus.status == HttpCodes.OK) {
        core.info(`Successfully updated pull request #${pullNumber}`)
      }
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

function parsePullRequestId(githubRef: string): number {
  const result = /refs\/pull\/(\d+)\/merge/g.exec(githubRef)
  if (!result) throw new Error('Reference not found.')
  const [, pullRequestId] = result
  return parseInt(pullRequestId)
}
