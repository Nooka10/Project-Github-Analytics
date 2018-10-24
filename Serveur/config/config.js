const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    port: process.env.PORT || 3000,
    db: 'mongodb+srv://ouzgaga:ouzgaga@cluster0-7foch.gcp.mongodb.net/GithubAnalytics?retryWrites=true'
  },

  test: {
    root: rootPath,
    port: process.env.PORT || 3000,
    db: 'mongodb+srv://ouzgaga:ouzgaga@cluster0-7foch.gcp.mongodb.net/GithubAnalytics?retryWrites=true'
  },

  production: {
    root: rootPath,
    port: process.env.PORT || 3000,
    db: 'mongodb+srv://ouzgaga:ouzgaga@cluster0-7foch.gcp.mongodb.net/GithubAnalytics?retryWrites=true'
  }
};

module.exports = config[env];
