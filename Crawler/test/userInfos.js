const chai = require('chai');

const credentials = require('../github_credentials.json');
const Agent = require('../src/agent.js');

const should = chai.should();

it('should fetch user informations', (done) => {
  const agent = new Agent(credentials);
  agent.fetchAndProcessUserInformations('ouzgaga', (err, users) => {
    should.not.exist(err);
    users.should.be.an('Object');
    done();
  });
});
