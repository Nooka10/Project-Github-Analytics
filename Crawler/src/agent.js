const request = require('superagent');

class Agent {
  constructor(credentials) {
    this.credentials = credentials;
  }

  fetchAndProcessMostFollowedUsers(allMostFollowedUsersAreFound) {
    const targetUrl = 'https://api.github.com/search/users?q=followers:>=1000';
    let users = [];

    function fetchAndProcessPage(pageUrl, credentials) {
      request
        .get(pageUrl)
        .auth(credentials.username, credentials.token)
        .end((err, res) => {
          users = users.concat(res.body);
          if (res.links.next) {
            fetchAndProcessPage(res.links.next, credentials);
          } else { // appelle de la fonction de callback
            allMostFollowedUsersAreFound(null, users);
          }
        });
    }
    fetchAndProcessPage(targetUrl, this.credentials);
  }

  fetchAndProcessUserInformations(pseudo, allUserInfosAreFound) {
    const targetUrl = `https://api.github.com/users/${pseudo}`;
    let users;
    request
      .get(targetUrl)
      .auth(this.credentials.username, this.credentials.token)
      .end((err, res) => {
        users = res.body;
        allUserInfosAreFound(err, users);
      });
  }
}

module.exports = Agent;
