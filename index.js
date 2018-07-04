const { createConfigYML } = require('./src/config-yml-utils');
const { getGittyData } = require('./src/github-utils');
const { processCircleCI } = require('./src/process-circle-ci-details');
const {
  processSuccessMessage,
  processFailureMessage
} = require('./src/process-comments');

/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */

let gittyData;

const createRobot = app => {
  // Your code here
  app.log('Yay, the app was loaded!');

  app.on('installation.created', async context => {
    app.log('App has been successfully installed. Yay!.');
    const [owner, repo] = await context.payload.repositories[0].full_name.split(
      '/'
    );
    app.log(`repo: ${owner}/${repo}`);
    createConfigYML(context, { owner, repo });
  });

  app.on('status', async context => {
    const ciContext = context.payload.context;
    const isCircle = ciContext ? ciContext.includes('circleci') : false;
    const { state } = context.payload;
    // // Check if the status is coming from CircleCI
    if (!isCircle) {
      return;
    }
    // If it is, we are only currently interested in success and failure events
    if (state !== 'success' && state !== 'failure') {
      return;
    }

    // If we are here, than its definitely a CircleCI failure or success. Shall we begin? :)

    gittyData = await getGittyData(context);

    // 1: Get config from gitty-probot.yml if exists(for Private Repos.)
    // We will post a comment on a private repo is the configYML returns falso. Don't know if I'll get to this though.
    // Putting this here to try to do this later.
    // const configYML = await getConfigFromYML(context);

    // If Success: Just post cool commment
    if (gittyData.buildState === 'success') {
      // TODO, post cool comment
      await processSuccessMessage(context, gittyData);
    }

    if (gittyData.buildState === 'failure') {
      const ciMessage = await processCircleCI(gittyData.ciRestUrlWithoutToken);
      await processFailureMessage(context, gittyData, ciMessage);
    }
  });
};

module.exports = createRobot;
