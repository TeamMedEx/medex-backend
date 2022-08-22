const express = require('express')
const router = express.Router()
const { getAll, bulkCreate, createOrUpdate, deleteOne } = require('../../app/controllers/v1/product.controller')

router.get('/product/all', getAll)
router.post('/product/delete', deleteOne)
router.post('/product/store', createOrUpdate)
router.post('/product/store/bulk', bulkCreate)

module.exports = router