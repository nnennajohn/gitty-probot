const defaultConfig = {
  // hard-coding for only my test project
  ciToken: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
}

const putConfigYML = (context, { owner, repo, content }) => {
  console.log('In putConfigYML.js...')
  context.github.repos.createFile({
    owner: owner,
    repo: repo,
    path: '.github/gitty-probot.yml',
    message:
      'Added .github/gitty-probot.yml. Please update with Circle Token if using a private repo.',
    content: content
  })
}

const createConfigYML = (context, { owner, repo }) => {
  console.log('In createConfigYML.js...')
  const content = Buffer.from(
    `# Configuration for Gitty Probot - https://github.com/apps/gitty-probot
    ciToken: ${defaultConfig.ciToken}
  `
  ).toString('base64')
  putConfigYML(context, {
    owner: owner,
    repo: repo,
    path: '.github/gitty-probott.yml',
    message: 'Added .github/gitty-probot.yml',
    content: content
  })
}

const getConfigFromYML = async context => {
  let config = null

  try {
    config = await context.config('.github/gitty-probot.yml', defaultConfig)
    context.log(config, 'Loaded config')
  } catch (err) {
    if (err.code !== 404) {
      throw err
    }
  }

  return Object.assign({}, defaultConfig, config)
}

module.exports = {
  defaultConfig,
  putConfigYML,
  createConfigYML,
  getConfigFromYML
}
