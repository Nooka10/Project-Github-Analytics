const path = require('path');

const rootPath = path.normalize(`${__dirname}/..`);
const env = process.env.NODE_ENV || 'development';

/**
 * Fichier de configuration indiquant les variables à utiliser en fonction de la variable NODE_ENV.
 */
const config = {
  development: {
    root    : rootPath,
    port    : process.env.PORT || 3000,
    db      : `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DBNAME_DEV}`,
    dbOnline: `mongodb+srv://${process.env.USER_MONGODB_ATLAS}:${process.env.PASSWORD_MONGODB_ATLAS}@${process.env.ATLAS_CONNECTION_STRING}`
  },

  test: {
    root    : rootPath,
    port    : process.env.PORT || 3000,
    db      : `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DBNAME_TEST}`,
    dbOnline: `mongodb+srv://${process.env.USER_MONGODB_ATLAS}:${process.env.PASSWORD_MONGODB_ATLAS}@${process.env.ATLAS_CONNECTION_STRING}`

  },

  production: {
    root: rootPath,
    port: process.env.PORT || 3000,
    db  : `mongodb+srv://${process.env.USER_MONGODB_ATLAS}:${process.env.PASSWORD_MONGODB_ATLAS}@${process.env.ATLAS_CONNECTION_STRING}`
  }
};

module.exports = config[env];
