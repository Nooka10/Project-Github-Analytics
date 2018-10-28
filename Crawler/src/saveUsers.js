
const mongoose = require('mongoose');

const credentials = require('../github_credentials.json');

const Agent = require('./agent.js');

const agent = new Agent(credentials);

// mongoose.connect('mongodb+srv://ouzgaga:ouzgaga@cluster0-7foch.gcp.mongodb.net/GithubAnalytics?retryWrites=true', (err) => {
mongoose.connect('mongodb+srv://apiuser:L1F3mWm5SP59s0jw@cluster-hchbv.gcp.mongodb.net/test?retryWrites=true', (err) => {
  if (err) { throw err; }
});

const { Schema } = mongoose;

const mostFollowedUserSchema = new Schema({
  avatar: { type: String, required: true },
  pseudo: { type: String, required: true },
  name: { type: String, required: false },
  nb_followers: { type: Number, required: true },
  location: { type: String, required: false },
  link: { type: String, required: true },
});

const FollowedUserModel = mongoose.model('most_followed_users', mostFollowedUserSchema);

FollowedUserModel.remove({}, () => {
  console.log('collection most_followed_users removed');
});

agent.fetchAndProcessMostFollowedUsers((err, users) => {
  users.forEach((tab) => {
    tab.items.forEach((user) => {
      agent.fetchAndProcessUserInformations(user.login, ((err, userInfos) => {
        const u = new FollowedUserModel({
          avatar: userInfos.avatar_url,
          pseudo: userInfos.login,
          name: userInfos.name,
          nb_followers: userInfos.followers,
          location: userInfos.location,
          link: userInfos.html_url,
        });
        u.save();// .then(() => console.log('inscrit'));
      }));
    });
  });
});


const mostStarredReposSchema = new Schema({
  repo_name: { type: String, required: true },
  owner: { type: String, required: true },
  language: { type: String, required: false },
  nb_stars: { type: Number, required: true },
  description: { type: String, required: false },
  link: { type: String, required: true },
});

const StarredRepoModel = mongoose.model('starred_repos', mostStarredReposSchema);

StarredRepoModel.remove({}, () => {
  console.log('collection starred_repos removed');
});

agent.fetchAndProcessMostStarredRepos((err, tab) => {
  tab.forEach((repos) => {
    repos.items.forEach((repo) => {
      const r = new StarredRepoModel({
        repo_name: repo.name,
        owner: repo.owner.login,
        language: repo.language,
        nb_stars: repo.stargazers_count,
        description: repo.description,
        link: repo.html_url,
      });
      r.save();// .then(() => console.log('inscrit'));
    });
  });
});

const mostForkedReposSchema = new Schema({
  repo_name: { type: String, required: true },
  owner: { type: String, required: true },
  language: { type: String, required: false },
  nb_forks: { type: Number, required: true },
  description: { type: String, required: false },
  link: { type: String, required: true },
});

const ForkedReposModel = mongoose.model('forked_repos', mostForkedReposSchema);

ForkedReposModel.remove({}, () => {
  console.log('collection forked_repos removed');
});

agent.fetchAndProcessMostForkedRepos((err, tab) => {
  tab.forEach((repos) => {
    repos.items.forEach((repo) => {
      const r = new ForkedReposModel({
        repo_name: repo.name,
        owner: repo.owner.login,
        language: repo.language,
        nb_forks: repo.forks_count,
        description: repo.description,
        link: repo.html_url,
      });
      r.save();// .then(() => console.log('inscrit'));
    });
  });
});

// mongoose.connection.close();
