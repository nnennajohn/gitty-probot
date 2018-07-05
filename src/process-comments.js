const dedent = require('dedent');
const stripAnsi = require('strip-ansi');

// Temp. Mess with this and get working before going full CircleCI ish. :)

const processSuccessMessage = async (context, gittyData) => {
  await context.github.issues.createComment({
    owner: gittyData.owner,
    repo: gittyData.repo,
    number: gittyData.pullRequestNumber,
    body: dedent`
    #### 😎 ${gittyData.capitalizedBuildState}
    ✌️ ✌️ ✌️ You've got some Badassry! ✌️ ✌️ ✌️ 
    ---
    ###### ☑️ Circle CI has passed all ya **${
      gittyData.ciContextSuccessTest
    }** tests. Now go break some tests.
    ---
    ${
      gittyData.ciContext
        ? `- **From ${gittyData.ciContext}: ${
            gittyData.buildStateDescription
          }**`
        : ''
    }
    ###### This comment was generated by [Gitty Probot](https://github.com/nnennajohn/gitty-probot) on (${new Date().toDateString()})
    `
  });
};

const processFailureMessage = async (context, gittyData, ciMessage) => {
  await context.github.issues.createComment({
    owner: gittyData.owner,
    repo: gittyData.repo,
    number: gittyData.pullRequestNumber,
    body: dedent`
    #### 😎 ${gittyData.capitalizedBuildState}
    ---
    ###### ❌ ❌ Circle CI has failed some of your tests. ❌❌
    ###### See details below:
    ---
      ${unescape(stripAnsi(ciMessage))}
    ---
    ${
      gittyData.ciContext
        ? `- **From ${gittyData.ciContext}: ${
            gittyData.buildStateDescription
          }**`
        : ''
    }
    ###### This comment was generated by [Gitty Probot](https://github.com/nnennajohn/gitty-probot) on (${new Date().toDateString()})
    `
  });
};

module.exports = {
  processSuccessMessage,
  processFailureMessage
};
