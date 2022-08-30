const express = require('express')
const router = express.Router()
const { getAll, detail, createOrUpdate, deleteOne } = require('../../app/controllers/v1/user.controller')

router.get('/user/all', getAll)
router.get('/user/:id/detail', detail)
router.post('/user/delete', deleteOne)
router.post('/user/store', createOrUpdate)

module.exports = router