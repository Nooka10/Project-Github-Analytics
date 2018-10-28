require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const dirty = require('dirty-chai');

chai.use(chaiHttp);
chai.should();

const mongoose = require('mongoose');
const config = require('../config/config');
mongoose.Promise = require('bluebird');

mongoose.connect(config.db, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, `unable to connect to database at ${config.db}`));
db.once('open', () => {
  console.log(`Connecté à la DB ${config.db}\n`);
});

chai.should();
chai.use(dirty);
