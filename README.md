# Update your pull request from Redmine - with Redmine Sync :arrows_counterclockwise:

This action allows you to update your pull requests with additional information
from Redmine. You can sync the following information:

- Issue title
- Issue description
- Issue type / Tracker

## Usage

In the following example you can find the default setup for this action. It
requires the `write` permission to update your pull requests and may only run if
a pull request is created. For additional options, see [Options](#options)

```yaml
name: Update pull requests from redmine

on:
  pull_request:
    types:
      - opened

permissions:
  pull-requests: write

jobs:
  update-from-redmine:
    name: Update from Redmine
    runs-on: ubuntu-latest

    steps:
      - name: Redmine Sync
        uses: tim-otte/redmine-sync@v0.3.4
        with:
          redmine-url: ${{ secrets.REDMINE_URL }}
          redmine-api-key: ${{ secrets.REDMINE_API_KEY }}
```

## Options

You can use the following options to customize this action: (**bold** =
required, _italic_ = provided by GitHub, defaults to `${{ github.token }}`)

| Name                  | Type   | Description                                                                          |
| --------------------- | ------ | ------------------------------------------------------------------------------------ |
| **redmine-url**       | string | The URL of your Redmine instance, e.g `https://example.com/redmine`                  |
| **redmine-api-key**   | string | The API key of your Redmine account (:warning: do not use admin accounts)            |
| _GITHUB_TOKEN_        | string | The GitHub API token to use to update the pull requests                              |
| update-title          | bool   | Set this to `true` if you want to automatically update the title, otherwise to false |
| add-issue-description | string | You can `append` or `replace` the issue body in the pull request or `none` of both   |
