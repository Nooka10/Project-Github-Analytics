const env = process.env.NODE_ENV || 'development';

/**
 * Fichier de configuration indiquant les variables à utiliser en fonction de la variable NODE_ENV.
 */
const config = {
  development: {
    url : `${process.env.URL}:${process.env.PORT || 3000}/`
  },

  test: {
    url : `${process.env.URL}:${process.env.PORT || 3000}/`
  },

  production: {
    url : 'https://api-projet-github.herokuapp.com/'
  }
};

module.exports = config[env];
