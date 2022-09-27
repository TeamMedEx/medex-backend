const express = require('express')
const router = express.Router()
const { verifyToken } = require('../../middlewares/auth.middleware');
const { getAll, store, update, deleteOne, submit } = require('../../controllers/v1/exam.controller')

router
  .use(verifyToken)
  .get('/exam/all', getAll)
  .post('/exam/store', store)
  .post('/exam/:oid/update', update)
  .delete('/exam/:oid/delete', deleteOne)
  .post('/exam/:oid/submit', submit)

module.exports = router