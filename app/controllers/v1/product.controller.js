const LOG = 'ProductController';
const _ = require('lodash')
const moment = require('moment')
const ProductModel = require('../../models/product')
// const seed = require('../../../seeds/product_seed.json')

module.exports = {
  createOrUpdate: async (req, res) => {
    console.log(`┌─ ${LOG} : save product`);
    const payload = req.body
    let whereClause = {}
    let existingRecord = {}

    payload.updated_at = moment()

    if (payload._id != undefined) {
      whereClause = {
        _id: payload._id
      }
      existingRecord = await ProductModel.findOne(whereClause, '_id')
      if (!existingRecord) {
        return res.locals.helpers.jsonFormat(400, 'Invalid _id input', {})
      }
      await ProductModel.updateOne(whereClause, payload)
    } else {
      payload.created_at = moment()
      await ProductModel.create(payload)
    }
    return res.locals.helpers.jsonFormat(200, 'Success to save new product', { existingRecord, whereClause })
  },
  bulkCreate: async (req, res) => {
    console.log(`┌─ ${LOG} : save bulk product`);
    await ProductModel.insertMany(req.body.payload)
    console.log(`└─ ${LOG} : save bulk product -> Success`);
    return res.locals.helpers.jsonFormat(200, 'Success bulk save product')
  },
  deleteOne: async (req, res) => {
    const payload = req.body
    const whereClause = { _id: payload._id }
    await ProductModel.deleteOne(whereClause)
    return res.locals.helpers.jsonFormat(200, 'Success to delete product')
  },
  getAll: async (req, res) => {
    console.log(`┌─ ${LOG} : all product`);
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
      title: 1,
      cover: 1,
      avgRating: 1,
      ratings: 1,
      price: 1,
      oldPrice: 1,
      stock: 1
    }

    // execute query
    const records = await ProductModel.find(conditions)
      .select(fields)
      .sort({ "updated_at": -1, "_id": -1 })
      .limit(limit)
      .skip(skip)
      .exec();
    return res.locals.helpers.jsonFormat(200, 'Success get all product', { records })
  },
  getOne: async (req, res) => {
    console.log(`┌─ ${LOG} : single product`);
  }
}