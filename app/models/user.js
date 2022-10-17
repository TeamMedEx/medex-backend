const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  uid: String,
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  source: { type: String, enum: ['EMAIL', 'GOOGLE'], default: "EMAIL" },
  name: String,
  phone: String,
  university: String,
  profile_picture: String,
  refresh_token: String,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: Date,
  exam_limit: Number,
  membership: String
});

userSchema.pre("save", function (next) {
  const user = this
  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, function (saltError, salt) {
      if (saltError) {
        return next(saltError)
      } else {
        bcrypt.hash(user.password, salt, function (hashError, hash) {
          if (hashError) {
            return next(hashError)
          }
          user.password = hash
          next()
        })
      }
    })
  } else {
    return next()
  }
})

userSchema.methods.comparePassword = function (password) {
  return new Promise(async (resolve) => {
    try {
      const valid = await bcrypt.compare(password, this.password)
      resolve(valid)
    } catch (error) {
      resolve(false)
    }
  })
}

const UserModel = mongoose.model('users', userSchema);

module.exports = UserModel;