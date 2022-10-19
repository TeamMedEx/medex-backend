const express = require('express')
const router = express.Router()
const { verifyToken } = require('../../middlewares/auth.middleware');
const { getAll, store, update, deleteOne, submit, detail } = require('../../controllers/v1/exam.controller')

router
  .use(verifyToken)
  .get('/exam/all', getAll)
  .get('/exam/:oid/detail', detail)
  .post('/exam/store', store)
  .post('/exam/:oid/update', update)
  .delete('/exam/:oid/delete', deleteOne)
  .post('/exam/:oid/submit', submit)

module.exports = router