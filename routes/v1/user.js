const express = require('express')
const router = express.Router()
const { getAll, bulkCreate, createOrUpdate, deleteOne } = require('../../app/controllers/v1/user.controller')

router.get('/user/all', getAll)
router.post('/user/delete', deleteOne)
router.post('/user/store', createOrUpdate)
// router.post('/user/store/bulk', bulkCreate)

module.exports = router