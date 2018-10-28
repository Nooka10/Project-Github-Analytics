const baseUrl = window.location.hostname !== 'localhost'
  ? 'http://localhost:3000'
  : 'https://api-projet-github.herokuapp.com';

module.exports = baseUrl;
