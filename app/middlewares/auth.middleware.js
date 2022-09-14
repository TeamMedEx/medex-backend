const jwt = require("jsonwebtoken")
const { TokenExpiredError } = jwt

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.locals.helpers.jsonFormat(401, 'Unauthorized! Access Token was expired!')
  }
  return res.locals.helpers.jsonFormat(401, 'Unauthorized!')
}

module.exports = {
  verifyToken: (req, res, next) => {
    let token = req.headers["x-access-token"]
    if (!token) {
      return res.locals.helpers.jsonFormat(403, 'No token provided!')
    }
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return catchError(err, res)
      }
      req.userId = decoded.id
      next()
    })
  }
}