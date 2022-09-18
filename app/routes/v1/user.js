const express = require('express')
const router = express.Router()
const { verifyToken } = require('../../middlewares/auth.middleware');
const { getAll, login, store, update, deleteOne, refreshToken } = require('../../controllers/v1/user.controller')

router
  .post('/user/store', store)
  .post('/user/login', login)
  .post('/user/refresh-token', refreshToken)

router
  .use(verifyToken)
  .get('/user/all', getAll)
  .post('/user/:oid/update', update)
  .delete('/user/:oid/delete', deleteOne)


module.exports = router