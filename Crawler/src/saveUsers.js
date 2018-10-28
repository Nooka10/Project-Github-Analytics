
const mongoose = require('mongoose');

const credentials = require('../github_credentials.json');

const Agent = require('./agent.js');

const agent = new Agent(credentials);

mongoose.connect('mongodb+srv://ouzgaga:ouzgaga@cluster0-7foch.gcp.mongodb.net/GithubAnalytics?retryWrites=true', (err) => {
  if (err) { throw err; }
});

const { Schema } = mongoose;

const mostFollowedUserSchema = new Schema({
  avatar: { type: String },
  pseudo: { type: String },
  name: { type: String },
  nb_followers: { type: Number },
  location: { type: String },
  link: { type: String },
});

const FollowedUserModel = mongoose.model('most_followed_users', mostFollowedUserSchema);

FollowedUserModel.deleteMany({}, () => {
  console.log('collection most_followed_users removed');
});

const promise1 = agent.fetchAndProcessMostFollowedUsers((err, users) => {
  users.forEach((tab) => {
    tab.items.forEach((user) => {
      agent.fetchAndProcessUserInformations(user.login, ((_err, userInfos) => {
        const u = new FollowedUserModel({
          avatar: userInfos.avatar_url,
          pseudo: userInfos.login,
          name: userInfos.name,
          nb_followers: userInfos.followers,
          location: userInfos.location,
          link: userInfos.html_url,
        });
        u.save().then(() => console.log(`Utilisateur ${user.login} ajoute`));
      }));
    });
  });
});


const mostStarredReposSchema = new Schema({
  repo_name: { type: String },
  owner: { type: String },
  language: { type: String },
  nb_stars: { type: Number },
  description: { type: String },
  link: { type: String },
});

const StarredRepoModel = mongoose.model('starred_repos', mostStarredReposSchema);

StarredRepoModel.deleteMany({}, () => {
  console.log('collection starred_repos removed');
});

const promise2 = agent.fetchAndProcessMostStarredRepos((err, tab) => {
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
      r.save().then(() => console.log(`Repo ${repo.name} ajoute`));
    });
  });
});

const mostForkedReposSchema = new Schema({
  repo_name: { type: String },
  owner: { type: String },
  language: { type: String },
  nb_forks: { type: Number },
  description: { type: String },
  link: { type: String },
});

const ForkedReposModel = mongoose.model('forked_repos', mostForkedReposSchema);

ForkedReposModel.deleteMany({}, () => {
  console.log('collection forked_repos removed');
});

const promise3 = agent.fetchAndProcessMostForkedRepos((err, tab) => {
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
      r.save().then(() => console.log(`Repo ${repo.name} ajoute`));
    });
  });
});

Promise.all([promise1, promise2, promise3]).then(() => {
  mongoose.connection.close();
});
