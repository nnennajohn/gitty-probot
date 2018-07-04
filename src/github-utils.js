const get = require('lodash.get')

function capitalizeString (str) {
  return str
    .charAt(0)
    .toUpperCase()
    .concat(str.slice(1).toLowerCase())
}

const getGittyData = async context => {
  // extract stuff we'll need later from context;
  const {
    payload: {
      sha,
      name,
      target_url,
      state,
      description,
      commit,
      branches,
      repository
    }
  } = context
  const ciContext = context.payload.context

  // Here, we are getting the repoPathPlusBuildNum from the target_url prop;
  const repoPathPlusBuildNum = target_url
    .split('?')[0]
    .split('https://circleci.com/gh/')
  const ciRestUrlWithoutToken = `https://circleci.com/api/v1.1/project/github/${
    repoPathPlusBuildNum[1]
  }`
  const buildNumber = repoPathPlusBuildNum[1].split('/')[2]

  // Get Owner, Repo and IssueNumber for comments
  const { owner, repo } = context.repo()
  const pullRequests = await context.github.pullRequests.getAll({
    owner,
    repo,
    head: `${commit.author.login}:${branches[0].name}`
  })
  const pullRequest = get(pullRequests, 'data[0]', {})
  const { number } = pullRequest

  return {
    sha,
    repoPath: name,
    ciUrl: target_url,
    ciContext,
    ciContextSuccessTest: ciContext.split(':')[1] || '',
    buildState: state,
    // Only putting this here so I don't need to import this func jus to do this.
    capitalizedBuildState: capitalizeString(state),
    buildStateDescription: description,
    committerName: commit.author.login,
    committerFullName: get(commit, 'commit.committer.name', `A team member's`),
    branchName: branches[0].name,
    repoPathPlusBuildNum: repoPathPlusBuildNum[1],
    ciRestUrlWithoutToken,
    buildNumber,
    owner,
    repo,
    pullRequestNumber: number,
    isPrivate: repository.private
  }
}

module.exports = {
  getGittyData
}
