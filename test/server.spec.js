const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/server');

chai.use(chaiHttp);
const { expect } = chai;

describe('API Tests', function(){
  let createdUserId;
  let app;
  before((done) => {
    app = server.listen(0, () => {
      done();
    });
  });

  after(() => {
    app.close();
  });
  this.timeout(5000); 
  it('should get all records with a GET api/users request (expect an empty array)', (done) => {
    chai.request(app)
      .get('/api/users')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array').that.is.empty;
        done();
      });
  });

  it('should create a new object with a POST api/users request', (done) => {
    const newUser = {
      username: 'JohnDoe',
      age: 25,
      hobbies: ['Reading', 'Traveling'],
    };

    chai.request(app)
      .post('/api/users')
      .send(newUser)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('_id');
        createdUserId = res.body._id;
        done();
      });
  });

  it('should get the created record with a GET api/users/{userId} request', (done) => {
    chai.request(app)
      .get(`/api/users/${createdUserId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body._id).to.equal(createdUserId);
        done();
      });
  });

  it('should update the created record with a PUT api/users/{userId} request', (done) => {
    const updatedUser = {
      username: 'UpdatedJohnDoe',
      age: 26,
      hobbies: ['Reading', 'Traveling', 'Gaming'],
    };

    chai.request(app)
      .put(`/api/users/${createdUserId}`)
      .send(updatedUser)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body._id).to.equal(createdUserId);
        expect(res.body.username).to.equal(updatedUser.username);
        expect(res.body.age).to.equal(updatedUser.age);
        expect(res.body.hobbies).to.deep.equal(updatedUser.hobbies);
        done();
      });
  });

  it('should delete the created object by id with a DELETE api/users/{userId} request', (done) => {
    chai.request(app)
      .delete(`/api/users/${createdUserId}`)
      .end((err, res) => {
        expect(res).to.have.status(204);
        done();
      });
  });

  it('should not get a deleted object by id with a GET api/users/{userId} request', (done) => {
    chai.request(app)
      .get(`/api/users/${createdUserId}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});
