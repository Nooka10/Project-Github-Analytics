const credentials = require('../github_credentials.json');

const Agent = require('./agent.js');


const agent = new Agent(credentials);
agent.fetchAndProcessMostFollowedUsers((err, users) => {
  users.map((tab) => {
    if (tab.items !== undefined) {
      tab.items.map((user) => {
        if (user !== undefined) {
          console.log(user.login);
        }
        return null;
      });
    }
    return null;
  });
});
