const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const Graph = require('../app/graph');
const usersController = require('../app/controllers/users.controller');
const utilsController = require('../app/controllers/utils.controller');
const graphController = require('../app/controllers/graph.controller');
const othersController = require('../app/controllers/others.controller');
require('../app/models/followers.model');
require('../app/models/forks.model');
require('../app/models/stars.model');

module.exports = (app, config) => {
  const env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env === 'development';

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser());
  app.use(compress());
  app.use(methodOverride());

  // on crée le graph et on l'attache à app afin d'utiliser la même instance dans les contrôleurs.
  app.set('graph', new Graph());

  /*
   * Routes
   */
  app.use('/users', usersController);
  app.use('/utils', utilsController);
  app.use('/graph', graphController);
  app.use('/others', othersController);

  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
      res.status(err.status || 500)
        .send({
          message: err.message,
          error  : err,
          title  : 'error'
        });
    });
  }

  app.use((err, req, res, next) => {
    res.status(err.status || 500)
      .send({
        message: err.message,
        error  : {},
        title  : 'error'
      });
  });

  return app;
};
