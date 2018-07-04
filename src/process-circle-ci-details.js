const axios = require('axios')

const getDetailedCILog = async outputUrl => {
  return axios
    .get(outputUrl)
    .then(response => {
      // This seems to always return two arrays, with the last one with err "Exit with code 1". Manually taking only
      // the first item for not.
      return response.data[0].message
    })
    .catch(error => {
      console.log(`Error in getDetailedCILog: ${error}`)
    })
}

// Handle Private Later.
// const processCircleCI = async (targetUrl, token = '') => {
//   let processedPath = targetUrl.split('?');
//   let repoPathPlusBuildNum = processedPath[0].split('https://circleci.com/gh/');
//   let url = `https://circleci.com/api/v1.1/project/github/${
//     repoPathPlusBuildNum[1]
//   }?circle-token=${token}`;
//   return getBuildMetadata(url);
// };

const processCircleCI = async ciRestUrlWithoutToken => {
  return axios
    .get(ciRestUrlWithoutToken)
    .then(response => {
      return response.data.steps.find(s =>
        s.actions.find(a => a.status === 'failed')
      )
    })
    .then(failingStepData => {
      return getDetailedCILog(failingStepData.actions[0].output_url)
    })
    .catch(error => {
      console.log(`Error in processCircleCI: ${error.message}`)
    })
}
module.exports = {
  processCircleCI
}
