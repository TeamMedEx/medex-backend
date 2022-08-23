const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  uid: String,
  username: String,
  password: String,
  email: String,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: Date,
});
const UserModel = mongoose.model('users', userSchema);

module.exports = UserModel;