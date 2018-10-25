const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const Graph = require('../app/graph');
const usersController = require('../app/controllers/users.controller');
const utilsController = require('../app/controllers/utils.controller');
const searchController = require('../app/controllers/search.controller');

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


  app.set('graph', new Graph());

  /*
   * Routes
   */
  app.use('/users', usersController);
  app.use('/utils', utilsController);
  app.use('/search', searchController);

  app.use('/', (req, res, next) => {
    res.status(200)
      .send('Hey mon ami! T\'aimes ça manger des patates?!');
  });

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
