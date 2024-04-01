import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { RedmineApi } from './redmine-api'
import * as markdown from './markdown'
import { HttpCodes } from '@actions/http-client'
import { Issue } from './redmine-models/issue'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
  try {
    const REDMINE_URL = core.getInput('redmine-url', { required: true })
    const REDMINE_API_KEY = core.getInput('redmine-api-key', { required: true })
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN', { required: true })

    core.startGroup('Checking action type')
    const pullRequest = context.payload.pull_request

    if (pullRequest === undefined) {
      core.setFailed('This action can only be run on Pull Requests')
      return
    }
    core.endGroup()

    core.startGroup('Fetching pull request info')
    const issueNumber = await getIssueNumberFromPullRequest(
      GITHUB_TOKEN,
      pullRequest.number
    )

    if (issueNumber === null) {
      core.info('Could not find ticket number. Exiting...')
      return
    }
    core.endGroup()

    core.startGroup('Redmine API setup/test')
    const redmineApi = new RedmineApi(REDMINE_URL, REDMINE_API_KEY)
    await testRedmineApi(redmineApi)
    core.endGroup()

    // Fetching the infos for the issue
    core.startGroup('Retrieve issue from Redmine and update pull request')
    const issue = await redmineApi.getIssue(issueNumber)
    if (issue === null) {
      core.info(`Could not find Redmine issue ${issueNumber}`)
    } else {
      await updatePullRequestFromRedmineIssue(
        GITHUB_TOKEN,
        redmineApi.getUrl(),
        pullRequest.number,
        issue
      )
    }
    core.endGroup()
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function updatePullRequestFromRedmineIssue(
  token: string,
  redmineUrl: string,
  pullNumber: number,
  issue: Issue
): Promise<void> {
  const updateStatus = await getOctokit(token).rest.pulls.update({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pullNumber,
    title: `${issue.issue.tracker.name} #${issue.issue.id}: ${issue.issue.subject}`,
    body:
      markdown.noteAlert(
        `**Redmine-Ticket:** ${markdown.link(`#${issue.issue.id}`, `${redmineUrl}/issues/${issue.issue.id}`)}`
      ) +
      markdown.LINE_BREAK +
      issue.issue.description
  })

  if (updateStatus.status === HttpCodes.OK) {
    core.info(`Successfully updated pull request #${pullNumber}`)
  } else return

  const label = getLabelFromIssue(issue)
  if (label !== null) {
    const labelUpdateStatus = await getOctokit(token).rest.issues.addLabels({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: pullNumber,
      labels: [label]
    })

    if (labelUpdateStatus.status === HttpCodes.OK) {
      core.info(`Successfully updated label for pull request #${pullNumber}`)
    }
  }
}

function getLabelFromIssue(issue: Issue): string | null {
  switch (issue.issue.tracker.name) {
    case 'Change Request':
      return 'change'
    case 'Feature':
      return 'feature'
    case 'Bug':
      return 'bug'
    default:
      return null
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

async function getIssueNumberFromPullRequest(
  token: string,
  pullNumber: number
): Promise<number | null> {
  const pullRequest = await getOctokit(token).rest.pulls.get({
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
      const [, issueNumberText] = result
      return parseInt(issueNumberText)
    }
  }
  return null
}
