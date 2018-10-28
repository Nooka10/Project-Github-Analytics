require('../app/models/user.model');
require('./chai-config');
const request = require('supertest');
const httpStatus = require('http-status');

const mongoose = require('mongoose');
const app = require('../app.js');

const Users = mongoose.model('User');

const benoitNV = {
  login  : 'Benoît not visited',
  visited: false
};
const antoineNV = {
  login  : 'Antoine not visited',
  visited: false
};
const benoitV = {
  login  : 'Benoît visited',
  visited: true
};
const antoineV = {
  login  : 'Antoine visited',
  visited: true
};
let ids;

describe('tests producers controller', () => {
  beforeEach(() => Users.remove()
    .then(() => Promise.all([antoineNV, benoitNV, antoineNV, benoitNV, antoineNV, benoitV, antoineV, benoitV].map(p => Users.create(p)))
      .then(res => ids = res.map(d => d._id.toString()))));

  describe('GET /users', () => {
    it('should fetch all users', () => request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect(httpStatus.OK)
      .then((response) => {
        response.body.should.be.an('array');
        response.body.length.should.be.equal(8);

        response.body.map(d => d._id.toString())
          .should
          .have
          .members(ids);
      }));

    it('should fetch all users with visited = false', () => request(app)
      .get('/users')
      .query({ visited: false }) // description contains 'Responsable'
      .set('Accept', 'application/json')
      .expect(httpStatus.OK)
      .then((response) => {
        response.body.should.be.an('array');
        response.body.should.be.lengthOf(5);
        const objects = response.body.map(d => d.login);
        objects.should.have.members([antoineNV.login, benoitNV.login, antoineNV.login, benoitNV.login, antoineNV.login]);
      }));

    it('should fetch all users with visited = true', () => request(app)
      .get('/users')
      .query({ visited: true }) // description contains 'Responsable'
      .set('Accept', 'application/json')
      .expect(httpStatus.OK)
      .then((response) => {
        response.body.should.be.an('array');
        response.body.should.be.lengthOf(3);
        const objects = response.body.map(d => d.login);
        objects.should.have.members([benoitV.login, antoineV.login, benoitV.login]);
      }));

    it('should fetch all producers with login = "Benoît not visited" AND visited = false', () => request(app)
      .get('/users')
      .query({
        login  : 'Benoît not visited',
        visited: false
      }) // login = "Benoît not visited" AND visited = false
      .set('Accept', 'application/json')
      .expect(httpStatus.OK)
      .then((response) => {
        response.body.length.should.be.equal(2);
      }));
  });

  describe('POST /users', () => {
    it('should add a new user', () => request(app)
      .post('/users')
      .send({
        login  : 'NewUser',
        visited: false
      })
      .set('Accept', 'application/json')
      .expect(httpStatus.OK)
      .then((response) => {
        response.body.should.be.an('object');
        response.body.login.should.be.equal('NewUser');
        response.body.visited.should.be.false;
      }));
  });


  describe('POST /users', () => {
    it('should add all new users of the array', () => request(app)
      .post('/users/addallusers')
      .send([
        {
          login  : 'NewUser1',
          visited: false
        }, {
          login  : 'NewUser2',
          visited: false
        }, {
          login  : 'NewUser3',
          visited: false
        }
      ])
      .set('Accept', 'application/json')
      .expect(httpStatus.OK)
      .then((response) => {
        response.text.should.be.eq('les utilisateurs suivants ont bien été ajoutés à la base de données : NewUser1,NewUser2,NewUser3');
      }));
  });
});
