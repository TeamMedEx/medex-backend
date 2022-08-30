const LOG = 'UserController';
const _ = require('lodash')
const moment = require('moment')
const UserModel = require('../../models/user')

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
      existingRecord = await UserModel.findOne(whereClause, '_id')
      if (!existingRecord) {
        return res.locals.helpers.jsonFormat(400, 'Invalid _id input', {})
      }
      await UserModel.updateOne(whereClause, payload)
    } else {
      payload.created_at = moment()
      await UserModel.create(payload)
    }
    return res.locals.helpers.jsonFormat(200, 'Success to save new user', { existingRecord, whereClause })
  },
  bulkCreate: async (req, res) => {
    console.log(`┌─ ${LOG} : save bulk user`);
    await UserModel.insertMany(req.body.payload)
    console.log(`└─ ${LOG} : save bulk user -> Success`);
    return res.locals.helpers.jsonFormat(200, 'Success bulk save user')
  },
  deleteOne: async (req, res) => {
    const payload = req.body
    const whereClause = { _id: payload._id }
    await UserModel.deleteOne(whereClause)
    return res.locals.helpers.jsonFormat(200, 'Success to delete user')
  },
  getAll: async (req, res) => {
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
      email: 1
    }

    // execute query
    const records = await UserModel.find(conditions)
      .select(fields)
      .sort({ "updated_at": -1, "_id": -1 })
      .limit(limit)
      .skip(skip)
      .exec();
    return res.locals.helpers.jsonFormat(200, 'Success get all user', { records })
  },
  detail: async (req, res) => {
    console.log(`┌─ ${LOG} : single user`);
    return res.locals.helpers.jsonFormat(200, 'Success get detail')
  }
}