const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    url : `localhost:${process.env.PORT || 3000}/`
  },

  test: {
    url : `localhost:${process.env.PORT || 3000}/`
  },

  production: {
    url : 'https://api-projet-github.herokuapp.com/'
  }
};

module.exports = config[env];
