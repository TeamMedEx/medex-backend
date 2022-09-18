const LOG = 'UserController';
const _ = require('lodash')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const User = require('../../models/user')

module.exports = {
  store: async (req, res) => {
    console.log(`┌─ ${LOG} : save user`);
    const payload = req.body
    Object.assign(payload, { updated_at: moment(), created_at: moment(), })
    await User.create(payload)
    return res.locals.helpers.jsonFormat(200, 'Success to save new user')
  },
  update: async (req, res) => {
    console.log(`┌─ ${LOG} : update user`);
    const { oid } = req.params
    const payload = req.body
    if (oid == undefined) {
      return res.locals.helpers.jsonFormat(400, 'Invalid oid input')
    }
    const existingRecord = await User.findOne({ _id: oid }, '_id')
    if (!existingRecord) {
      return res.locals.helpers.jsonFormat(400, 'User not Found')
    }
    Object.assign(existingRecord, payload)
    await existingRecord.save()
    return res.locals.helpers.jsonFormat(200, 'Success to save user', {})
  },
  deleteOne: async (req, res) => {
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
    const user = await User.findOne({ $or: [{ username: username }, { email: email }] }, "_id username email password").exec()
    if (user == null) {
      return res.locals.helpers.jsonFormat(400, 'Invalid username / email')
    }
    const valid = await user.comparePassword(password)
    if (!valid) {
      return res.locals.helpers.jsonFormat(400, 'Invalid password')
    }
    const token = jwt.sign(user.toJSON(), process.env.SECRET_KEY, {
      expiresIn: 60 * 60
    })
    const refreshToken = jwt.sign({}, process.env.SECRET_KEY, {
      expiresIn: 60 * 60 * 24
    })
    Object.assign(user, { refresh_token: refreshToken })
    user.save()

    return res.locals.helpers.jsonFormat(200, 'Success login', { token, refreshToken })
  },
  refreshToken: async (req, res) => {
    return res.locals.helpers.jsonFormat(200, 'Success refresh token', {})
  }
}