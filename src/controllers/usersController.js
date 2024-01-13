const { ObjectId } = require('bson');
const User = require('../models/user');
const {generateUUID, isValidUuid} = require('../utils/validateUuid');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  const { userId } = req.params;
  if (!isValidUuid(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};


const createUser = async (req, res, next) => {
  const { username, age, hobbies } = req.body;

  if (!username || !age) {
    return res.status(400).json({ error: 'Username and age are required fields' });
  }

  try {
    const _id = generateUUID();
    const user = await User.create({_id, username, age, hobbies });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  const { userId } = req.params;

  if (!isValidUuid(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  const { username, age, hobbies } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.username = username || user.username;
    user.age = age || user.age;
    user.hobbies = hobbies || user.hobbies;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  const { userId } = req.params;

  if (!isValidUuid(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.deleteOne();

    res.status(204).json({message:'User deleted successfully'});
  } catch (error) {
    next(error);
  }
};

module.exports= {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
}