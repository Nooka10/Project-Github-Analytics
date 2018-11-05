const request = require('superagent');

class Agent {
  constructor(credentials) {
    this.credentials = credentials;
  }

  fetchAndProcessMostFollowedUsers(allMostFollowedUsersAreFound) {
    const targetUrl = 'https://api.github.com/search/users?q=followers:>=1000&per_page=100';
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

  fetchAndProcessMostStarredRepos(allMostStarredReposAreFound) {
    const targetUrl = 'https://api.github.com/search/repositories?order=desc&q=stars%3A>1&sort=stars&per_page=100';
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
            allMostStarredReposAreFound(null, users);
          }
        });
    }
    fetchAndProcessPage(targetUrl, this.credentials);
  }

  fetchAndProcessMostForkedRepos(allMostForkedReposAreFound) {
    const targetUrl = 'https://api.github.com/search/repositories?order=desc&q=stars%3a>1&sort=forks&per_page=100';
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
            allMostForkedReposAreFound(null, users);
          }
        });
    }
    fetchAndProcessPage(targetUrl, this.credentials);
  }
}

module.exports = Agent;
