const LOG = 'UserController';
const _ = require('lodash')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const User = require('../../models/user')

module.exports = {
  createOrUpdate: async (req, res) => {
    console.log(`┌─ ${LOG} : save user`);
    const payload = req.body
    let whereClause = {}
    let existingRecord = {}

    payload.updated_at = moment()

    if (payload._id != undefined) {
      whereClause = {
        _id: payload._id
      }
      existingRecord = await User.findOne(whereClause, '_id')
      if (!existingRecord) {
        return res.locals.helpers.jsonFormat(400, 'Invalid _id input', {})
      }
      await User.updateOne(whereClause, payload)
    } else {
      payload.created_at = moment()
      await User.create(payload)
    }
    return res.locals.helpers.jsonFormat(200, 'Success to save new user', { existingRecord, whereClause })
  },
  bulkCreate: async (req, res) => {
    console.log(`┌─ ${LOG} : save bulk user`);
    await User.insertMany(req.body.payload)
    console.log(`└─ ${LOG} : save bulk user -> Success`);
    return res.locals.helpers.jsonFormat(200, 'Success bulk save user')
  },
  deleteOne: async (req, res) => {
    const payload = req.body
    const whereClause = { _id: payload._id }
    await User.deleteOne(whereClause)
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
        uid: 1,
        username: 1,
        password: 1,
        email: 1,
        refresh_token: 1
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