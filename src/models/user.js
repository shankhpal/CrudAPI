const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  age: { type: Number, required: true },
  hobbies: { type: [String], default: [] },
  _id: {type: String, required:true}
});

const User = mongoose.model('User', userSchema);

module.exports = User;
