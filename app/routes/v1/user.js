const express = require('express')
const router = express.Router()
const { verifyToken } = require('../../middlewares/auth.middleware');
const { getAll, login, createOrUpdate, deleteOne, refreshToken } = require('../../controllers/v1/user.controller')

router
  .post('/user/login', login)
  .post('/user/refresh-token', refreshToken)

router
  .use(verifyToken)
  .get('/user/all', getAll)
  .post('/user/delete', deleteOne)
  .post('/user/store', createOrUpdate)


module.exports = router