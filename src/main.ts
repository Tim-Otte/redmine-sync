import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { RedmineApi } from './redmine-api'
import { HttpCodes } from '@actions/http-client'
import { Issue } from './redmine-models/issue'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
  try {
    const pullNumber = getPullNumber()

    if (pullNumber === null) {
      core.setFailed('Could not find the number of the pull request')
      return
    }

    const issueNumber = await getIssueNumberFromPullRequest(pullNumber)

    if (issueNumber === null) {
      core.info('Could not find ticket number. Exiting...')
      return
    }

    const redmineApi = getRemineApi()

    await testRedmineApi(redmineApi)

    // Fetching the infos for the issue
    const issue = await redmineApi.getIssue(issueNumber)
    if (issue === null) {
      core.info(`Could not find Redmine issue ${issueNumber}`)
    } else {
      await updatePullRequestFromRedmineIssue(pullNumber, issueNumber, issue)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function updatePullRequestFromRedmineIssue(
  pullNumber: number,
  issueNumber: number,
  issue: Issue
): Promise<void> {
  const updateStatus = await getOctokit(
    core.getInput('GITHUB_TOKEN')
  ).rest.pulls.update({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pullNumber,
    title: `#${issueNumber} ${issue.issue.subject}`,
    body: issue.issue.description
  })

  if (updateStatus.status === HttpCodes.OK) {
    core.info(`Successfully updated pull request #${pullNumber}`)
  }
}

async function testRedmineApi(redmineApi: RedmineApi): Promise<void> {
  core.debug(`Testing connection to redmine instance...`)
  try {
    const account = await redmineApi.myAccount()
    core.info(
      `Successfully connected to Redmine. Hi ${account.user.firstname} ${account.user.lastname}!`
    )

    if (account.user.admin)
      core.warning(
        'Its not recommended to use a Redmine admin account for this action'
      )
  } catch (error) {
    let errorMessage =
      'Could not connect to Redmine. Please check the url and the API key.'
    if (error instanceof Error) errorMessage += `\n${error.message}`
    throw new Error(errorMessage)
  }
}

function getRemineApi(): RedmineApi {
  core.debug('Initializing Redmine API...')
  const redmineApi = new RedmineApi(
    core.getInput('redmine-url'),
    core.getInput('redmine-api_key')
  )
  return redmineApi
}

async function getIssueNumberFromPullRequest(
  pullNumber: number
): Promise<number | null> {
  const pullRequest = await getOctokit(
    core.getInput('GITHUB_TOKEN')
  ).rest.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pullNumber
  })

  if (pullRequest.status === HttpCodes.OK) {
    core.debug(
      `Found pull request ${pullRequest.data.id} with title '${pullRequest.data.title}'`
    )

    const result = /#(\d+)/g.exec(pullRequest.data.title)
    if (result != null) {
      const [, issueNumberText] = result[0]
      return parseInt(issueNumberText)
    }
  }
  return null
}

function getPullNumber(): number | null {
  if (context.eventName === 'pull_request') {
    core.debug(
      'This GitHub action has been started because a pull_request event has been triggered'
    )
    const result = /refs\/pull\/(\d+)\/merge/g.exec(context.ref)
    if (result != null) {
      const [, pullRequestIdText] = result
      return parseInt(pullRequestIdText)
    }
  }

  return null
}
