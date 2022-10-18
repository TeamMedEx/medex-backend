const LOG = 'UserController';
const _ = require('lodash')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const User = require('../../models/user')
const { verifyToken } = require("../../utils/helper")

const tokenExpiration = 60 * 60
const refreshExpiration = 60 * 60 * 24

const generateLoginTokens = (user) => {
  const refreshToken = jwt.sign({}, process.env.SECRET_KEY, {
    expiresIn: refreshExpiration
  })
  Object.assign(user, { refresh_token: refreshToken })
  user.save()

  const { username, email, name } = user.toJSON()
  const token = jwt.sign({ username, email, name }, process.env.SECRET_KEY, {
    expiresIn: tokenExpiration
  })
  const expiresAt = moment().add(tokenExpiration, 'seconds')
  return { refreshToken, token, expiresAt }
}

module.exports = {
  store: async (req, res) => {
    console.log(`┌─ ${LOG} : save user`);
    const payload = req.body
    const { username, email } = payload
    const user = await User.findOne({ $or: [{ username: username }, { email: email }] }, '_id source').lean()
    console.log({ user })
    if (user != null) {
      return res.locals.helpers.jsonFormat(400, "User exists", { code: `registered_by_${user.source == undefined ? "email" : user.source.toLowerCase()}` })
    }
    Object.assign(payload, { updated_at: moment(), created_at: moment(), })
    try {
      let tokenPayload = {}
      const newUser = await User.create(payload)
      const { refresh_token, expires_at } = payload
      if (refresh_token != undefined && expires_at != undefined && payload.source.toLowerCase() == "google") {
        tokenPayload = { refreshToken: payload.refresh_token, expiresAt: payload.expires_at, }
      } else {
        tokenPayload = generateLoginTokens(newUser)
      }
      return res.locals.helpers.jsonFormat(200, 'Success to save new user', tokenPayload)
    } catch ({ message }) {
      return res.locals.helpers.jsonFormat(400, message, null)
    }
  },
  update: async (req, res) => {
    console.log(`┌─ ${LOG} : update user`);
    const { oid } = req.params
    const payload = req.body

    const user = await User.findOne({ _id: oid }, '_id')
    if (!user) {
      return res.locals.helpers.jsonFormat(400, 'User not Found')
    }
    Object.assign(user, payload)
    await user.save()
    return res.locals.helpers.jsonFormat(200, 'Success to save user', {})
  },
  deleteOne: async (req, res) => {
    console.log(`┌─ ${LOG} : Delete user`);
    const { oid } = req.params
    await User.deleteOne({ _id: oid })
    return res.locals.helpers.jsonFormat(200, 'Success to delete user')
  },
  getAll: async (req, res) => {
    try {
      console.log(`┌─ ${LOG} : all user`);
      let { page = 1, limit = 10, search = '' } = req.query

      // paging
      page = parseInt(page, 10)
      limit = parseInt(limit, 10)
      skip = (page - 1) * limit;

      // set conditions
      let conditions = {}
      if (search != '') {
        const searchRegex = new RegExp(search, 'i')
        conditions = { title: searchRegex }
      }
      const fields = {
        _id: 1,
        username: 1,
        name: 1,
        email: 1,
        source: 1,
        refresh_token: 1,
        created_at: 1
      }

      // execute query
      const records = await User.find(conditions)
        .select(fields)
        .sort({ "updated_at": -1, "_id": -1 })
        .limit(limit)
        .skip(skip)
        .lean()
        .exec();
      return res.locals.helpers.jsonFormat(200, 'Success get all user', { records })
    } catch (error) {
      return res.locals.helpers.jsonFormat(200, 'error', error)
    }

  },
  login: async (req, res) => {
    console.log(`┌─ ${LOG} : login`);
    const { username, email, password } = req.body
    const user = await User.findOne({ $or: [{ username: username }, { email: email }] }, "_id username email password name").exec()
    if (user == null) {
      return res.locals.helpers.jsonFormat(400, 'Invalid username / email')
    }
    const valid = await user.comparePassword(password)
    if (!valid) {
      return res.locals.helpers.jsonFormat(400, 'Invalid password')
    }
    const tokenPayload = generateLoginTokens(user)
    return res.locals.helpers.jsonFormat(200, 'Success login', tokenPayload)
  },
  refreshToken: async (req, res) => {
    console.log(`┌─ ${LOG} : refresh token`)
    const { refreshToken } = req.body
    const valid = await verifyToken(refreshToken)
    if (!valid) {
      return res.locals.helpers.jsonFormat(401, 'Unauthorized! Refresh Token was expired!')
    }
    const user = await User.findOne({ refreshToken }, '_id username email')
    const newAccessToken = jwt.sign(user.toJSON(), process.env.SECRET_KEY, {
      expiresIn: refreshExpiration,
    })
    Object.assign(user, { refresh_token: null })
    user.save()
    return res.locals.helpers.jsonFormat(200, 'Success refresh token', { token: newAccessToken })
  }
}