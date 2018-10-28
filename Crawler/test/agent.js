const chai = require('chai');

const credentials = require('../github_credentials.json');
const Agent = require('../src/agent.js');

const should = chai.should();

describe('the GitHub API', () => {
  it('should fetch most followed users', (done) => {
    const agent = new Agent(credentials);
    agent.fetchAndProcessMostFollowedUsers((err, users) => {
      should.not.exist(err);
      users.should.be.an('array');
      done();
    });
  });

  it('should fetch most starred repos', (done) => {
    const agent = new Agent(credentials);
    agent.fetchAndProcessMostStarredRepos((err, users) => {
      should.not.exist(err);
      users.should.be.an('array');
      done();
    });
  });

  it('should fetch most forked repos', (done) => {
    const agent = new Agent(credentials);
    agent.fetchAndProcessMostForkedRepos((err, users) => {
      should.not.exist(err);
      users.should.be.an('array');
      done();
    });
  });
});
