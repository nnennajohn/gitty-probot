// You can import your modules
const { Application } = require('probot');
const plugin = require('../index');

const installationSuccessPayload = require('./fixtures/installation-success-payload.json');
const ciSuccessPayload = require('./fixtures/passing-test-status.json');
const ciFailurePayload = require('./fixtures/failing-test-status.json');

describe('Gitty Probot', () => {
  let app;
  let github;

  beforeEach(() => {
    // Here we create an `Application` instance
    app = new Application();
    // Here we initialize the app
    app.load(plugin);

    // Mock out the GitHub API
    github = {
      issues: {
        createComment: jest.fn()
      },
      repos: {
        createFile: jest.fn().mockReturnValue(Promise.resolve(true))
      },
      pullRequests: {
        getAll: jest.fn()
      }
    };

    // Passes the mocked out GitHub API into out app instance
    app.auth = () => Promise.resolve(github);
  });

  describe('ConfigYML Creation success on app install', () => {
    it('correctly installs gitty-probot yml file', async () => {
      await app.receive({
        event: 'installation.created',
        payload: installationSuccessPayload
      });
      // Should immediately create config file
      const createFileCalls = github.repos.createFile.mock.calls;
      const expectedReturnPath = '.github/gitty-probot.yml';
      const expectedReturnMessage = 'Added .github/gitty-probot.yml.';

      // Test that configYml func got called.
      expect(github.repos.createFile).toHaveBeenCalled();
      expect(createFileCalls.length).toBe(1);

      // Return Value of successfully creating config yml file
      const returnPath = createFileCalls[0][0].path;
      const returnMessage = createFileCalls[0][0].message;
      expect(returnPath.startsWith(expectedReturnPath)).toBeTruthy();
      expect(returnMessage.startsWith(expectedReturnMessage)).toBeTruthy();
    });
  });

  describe('Create Comment on Success', () => {
    it('correctly creates comment on success', async () => {
      await app.receive({
        event: 'status',
        payload: ciSuccessPayload
      });
      // Should immediately create comment on success payload
      const createCommentCalls = github.issues.createComment.mock.calls;

      const expectedReturnRepo = 'gitty-probot-test';
      const expectedReturnOwner = 'nnennajohn';

      // Test that createComment func got called.
      expect(github.issues.createComment).toHaveBeenCalled();
      expect(createCommentCalls.length).toBe(1);

      // // Return Value of successfully creating comment
      const returnRepo = createCommentCalls[0][0].repo;
      const returnOwner = createCommentCalls[0][0].owner;
      expect(returnRepo.startsWith(expectedReturnRepo)).toBeTruthy();
      expect(returnOwner.startsWith(expectedReturnOwner)).toBeTruthy();
    });
  });

  describe('Create Comment on Failure', () => {
    it('correctly creates comment on failure', async () => {
      await app.receive({
        event: 'status',
        payload: ciFailurePayload
      });
      // Should immediately create comment on failure payload
      const createCommentCalls = github.issues.createComment.mock.calls;

      const expectedReturnRepo = 'gitty-probot-test';
      const expectedReturnOwner = 'nnennajohn';

      // Test that createComment func got called.
      expect(github.issues.createComment).toHaveBeenCalled();
      expect(createCommentCalls.length).toBe(1);

      // // Return Value of successfully creating comment
      const returnRepo = createCommentCalls[0][0].repo;
      const returnOwner = createCommentCalls[0][0].owner;
      expect(returnRepo.startsWith(expectedReturnRepo)).toBeTruthy();
      expect(returnOwner.startsWith(expectedReturnOwner)).toBeTruthy();
    });
  });

  describe('Does not Create Comment if Status is not success or failure', () => {
    it('does not comment on failure', async () => {
      await app.receive({
        event: 'status',
        payload: {
          state: 'somethingElse'
        }
      });

      const createCommentCalls = github.issues.createComment.mock.calls;

      // Test that createComment func does got called.
      expect(github.issues.createComment).toHaveBeenCalledTimes(0);
      expect(createCommentCalls.length).toBe(0);
    });
  });
});
