const chai = require('chai');

const request = require('superagent');
const { username, token } = require('../github_credentials.json');

const should = chai.should();

describe('the GitHub API', () => {
  it('allows me to get the repo infos', (done) => {
    const url = 'https://api.github.com/repos/ouzgaga/TWEB-Labo1';
    request
      .get(url)
      .auth(username, token)
      .set('Accept', 'application/vnd.github.v3+json')
      .end((err, res) => {
        should.not.exist(err);
        should.exist(res);
        done();
      });
  });
});
