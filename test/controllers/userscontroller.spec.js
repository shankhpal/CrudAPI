const { expect } = require('chai');
const sinon = require('sinon');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../../src/controllers/usersController');
const User = require('../../src/models/user');
const {mockRequest,mockResponse} = require('mock-req-res');
const { isValidUuid } = require('../../src/utils/validateUuid');
const errorHandler = require('../../src/middleware/errorHandler');
describe('User Controller', () => {
  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [{ username: 'user1' }, { username: 'user2' }];
      sinon.stub(User, 'find').resolves(users);

      const req = mockRequest();
      const res = mockResponse();
      
      const allUsers = await getAllUsers(req, res);

      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.json, users);

      User.find.restore();
    });

    it('should handle errors', async () => {
        const error = new Error('Internal Server Error');
        sinon.stub(User, 'find').returns(error);
      
        const req = mockRequest();
        const res = mockResponse();
        const next = sinon.stub(()=>({ status: 500, json: error }));
        try{
          const allUsers = await getAllUsers(req, res, next);
        }catch(e){
          expect(e.name).to.be.equal('Internal Server Error')
        }
      
        User.find.restore();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const userId = '1a97c5e0-19d2-4a08-b704-750a17f92e85';
      const user = { _id: userId, username: 'user1' };
      console.log(isValidUuid(userId))
      sinon.stub(User, 'findById').returns(Promise.resolve(user));
    
      const req = mockRequest({params:{userId:userId}});
      const res = mockResponse();

      await getUserById(req, res);

      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.json, user);

      User.findById.restore();
    });

    it('should handle invalid userId', async () => {
      const userId = '65a14d39964dadf';

      const req = mockRequest({params:{userId:userId}});
      const res = mockResponse();
      res.status.returns(res);

      await getUserById(req, res);

      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledWith(res.json, { error: 'Invalid userId' });

    });

    it('should handle user not found', async () => {
      const userId = '1a97c5e0-19d2-4a08-b704-750a17f92e85';
      sinon.stub(User, 'findById').resolves(null);

      const req = mockRequest({params:{userId:userId}});
      const res = mockResponse();
      res.status.returns(res);

      await getUserById(req, res);

      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledWith(res.json, { error: 'User not found' });

      User.findById.restore();
    });

    it('should handle errors', async () => {
      const userId = '1a97c5e0-19d2-4a08-b704-750a17f92e85';
      const error = new Error('Internal Server Error');
      sinon.stub(User, 'findById').returns(error);
      
      const req = mockRequest({params:{userId:userId}});
      const res = mockResponse();
      res.status.returns(res);
      
      const next = sinon.stub(()=>({ status: 500, json: error }));
      try{
        const user = await getUserById(req, res, next);
      }catch(e){
        expect(e.name).to.be.equal('Internal Server Error')
      }

      User.findById.restore();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const newUser = { username: 'JohnDoe', age: 25, hobbies: ['Reading', 'Traveling'] };
      sinon.stub(User, 'create').returns(Promise.resolve(newUser));

      const req = mockRequest({body:newUser});
      const res = mockResponse();
      await createUser(req, res);

      sinon.assert.calledWith(res.status, 201);
      sinon.assert.calledWith(res.json, newUser);

      User.create.restore();
    });

    it('should handle missing username and age', async () => {
        const req = mockRequest();
        const res = mockResponse();

      await createUser(req, res);

      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledWith(res.json, { error: 'Username and age are required fields' });
    });

    it('should handle errors', async () => {
      const newUser = { username: 'JohnDoe', age: 25, hobbies: ['Reading', 'Traveling'] };
      const error = new Error('Internal Server Error');
      sinon.stub(User, 'create').returns(Promise.resolve(error));

      const req = mockRequest();
      const res = mockResponse();

      const next = sinon.stub(()=>({ status: 500, json: error }));
      try{
        const user = await createUser(req, res, next);
      }catch(e){
        expect(e.name).to.be.equal('Internal Server Error')
      }

      User.create.restore();
    });
  });

  describe('updateUser', () => {
    it('should update user by id', async () => {
      const userId = '1a97c5e0-19d2-4a08-b704-750a17f92e85';
      const updatedUser = { _id: userId, username: 'UpdatedJohnDoe', age: 26, hobbies: ['Reading', 'Traveling', 'Gaming'] };
      sinon.stub(User, 'findById').returns(Promise.resolve(new User(updatedUser)));
      sinon.stub(User.prototype, 'save').returns(Promise.resolve(updatedUser));

      const req = mockRequest({params:{userId:userId}});
      const res = mockResponse();
      await updateUser(req, res);

      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.json, updatedUser);

      User.findById.restore();
      User.prototype.save.restore();
    });

    it('should handle invalid userId', async () => {
      const userId = 'invalidUserId';

      const req = mockRequest({params:{userId:userId}});
      const res = mockResponse();
      await updateUser(req, res);

      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledWith(res.json, { error: 'Invalid userId' });

    });

    it('should handle user not found', async () => {
      const userId = '1a97c5e0-19d2-4a08-b704-750a17f92e85';
      sinon.stub(User, 'findById').returns(null);

      const req = mockRequest({params:{userId:userId}});
      const res = mockResponse();

      await updateUser(req, res);

      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledWith(res.json, { error: 'User not found' });

      User.findById.restore();
    });

    it('should handle errors', async () => {
      const userId = '1a97c5e0-19d2-4a08-b704-750a17f92e85';
      const error = new Error('Internal Server Error');
      sinon.stub(User, 'findById').returns({ _id: userId });
      sinon.stub(User.prototype, 'save').returns(error);

      const req = mockRequest({params:{userId:userId}});
      const res = mockResponse();

      const next = sinon.stub(()=>({ status: 500, json: error }));
      try{
        const user = await updateUser(req, res, next);
      }catch(e){
        expect(e.name).to.be.equal('Internal Server Error')
      }
      User.findById.restore();
      User.prototype.save.restore();
    });
  });

  describe('deleteUser', () => {
    it('should delete user by id', async () => {
      const userId = '1a97c5e0-19d2-4a08-b704-750a17f92e85';
      const user = { _id: userId };
      sinon.stub(User, 'findById').resolves(new User(user));
      sinon.stub(User.prototype, 'deleteOne').resolves({message:'User deleted successfully'});

      const req = mockRequest({params:{userId:userId}});
      const res = mockResponse();

      await deleteUser(req, res);

      sinon.assert.calledWith(res.status, 204);
      sinon.assert.calledOnce(User.prototype.deleteOne);

      User.findById.restore();
      User.prototype.deleteOne.restore();
    });

    it('should handle invalid userId', async () => {
      const userId = 'invalidUserId';

      const req = mockRequest({params:{userId:userId}});
      const res = mockResponse();

      await deleteUser(req, res);

      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledWith(res.json, { error: 'Invalid userId' });

    });

    it('should handle user not found', async () => {
      const userId = '1a97c5e0-19d2-4a08-b704-750a17f92e85';
      sinon.stub(User, 'findById').resolves(null);

      const req = mockRequest({params:{userId:userId}});
      const res = mockResponse();

      await deleteUser(req, res);

      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledWith(res.json, { error: 'User not found' });

      User.findById.restore();
    });

    it('should handle errors', async () => {
      const userId = '1a97c5e0-19d2-4a08-b704-750a17f92e85';
      const user = { _id: userId, username: 'UpdatedJohnDoe', age: 26, hobbies: ['Reading', 'Traveling', 'Gaming'] }
      const error = new Error('Internal Server Error');
      sinon.stub(User, 'findById').resolves(new User(user));
      sinon.stub(User.prototype, 'deleteOne').rejects(error);

      const req = mockRequest();
      const res = mockResponse();
     
      const next = sinon.stub(()=>({ status: 500, json: error }));
      try{
        const user = await deleteUser(req, res, next);
      }catch(e){
        expect(e.name).to.be.equal('Internal Server Error')
      }
      User.findById.restore();
      User.prototype.deleteOne.restore();
    });
  });
});
