const chai = require('chai');

const credentials = require('../github_credentials.json');
const Agent = require('../src/agent.js');

const should = chai.should();


it('should fetch most followed users', (done) => {
  const agent = new Agent(credentials);
  agent.fetchAndProcessMostFollowedUsers((err, users) => {
    should.not.exist(err);
    users.should.be.an('array');
    done();
  });
});
