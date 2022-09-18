
const jwt = require('jsonwebtoken')
module.exports = {
  verifyToken: async (token) => {
    return new Promise(async (resolve) => {
      let result = false
      try {
        jwt.verify(token, process.env.SECRET_KEY);
        result = true
      } catch (error) {
      }
      resolve(result)
    })
  }
}