const LOG = 'UserController';
const _ = require('lodash')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const Exam = require('../../models/exam')

module.exports = {
  store: async (req, res) => {
    console.log(`┌─ ${LOG} : save exam`);
    const payload = req.body
    Object.assign(payload, { updated_at: moment() })
    try {
      await Exam.create(payload)
      return res.locals.helpers.jsonFormat(200, 'Success to save new exam')
    } catch ({ message }) {
      return res.locals.helpers.jsonFormat(400, message, null)
    }
  },
  update: async (req, res) => {
    console.log(`┌─ ${LOG} : update exam`);
    const { oid } = req.params
    const payload = req.body

    const exam = await Exam.findOne({ _id: oid }, '_id')
    if (!exam) {
      return res.locals.helpers.jsonFormat(400, 'Exam not Found')
    }
    Object.assign(exam, payload)
    await exam.save()
    return res.locals.helpers.jsonFormat(200, 'Success to save exam', {})
  },
  deleteOne: async (req, res) => {
    console.log(`┌─ ${LOG} : Delete exam`);
    const { oid } = req.params
    await Exam.deleteOne({ _id: oid })
    return res.locals.helpers.jsonFormat(200, 'Success to delete exam')
  },
  getAll: async (req, res) => {
    try {
      console.log(`┌─ ${LOG} : all exam`);
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
        description: 1,
        type: 1,
        minimum_score: 1,
        "questions._id": 1,
        "questions.title": 1,
        "questions.description": 1,
        "questions.type": 1,
        "questions.image": 1,
        "questions.options": 1,
        "questions.correct_answer": 1,
        created_at: 1,
        updated_at: 1,
      }

      // execute query
      const records = await Exam.find(conditions)
        .select(fields)
        .sort({ "updated_at": -1, "_id": -1 })
        .limit(limit)
        .skip(skip)
        .lean()
        .exec();
      return res.locals.helpers.jsonFormat(200, 'Success get all exam', records)
    } catch (error) {
      return res.locals.helpers.jsonFormat(500, 'error', error)
    }
  },
  submit: async (req, res) => {
    try {
      console.log(`┌─ ${LOG} : submit exam`);
      // console.log(req.userId)
      const { oid } = req.params
      const { answers } = req.body
      const exam = await Exam.findOne({ _id: oid }, { _id: 1, minimum_score: 1, "questions._id": 1, "questions.correct_answer": 1 }).lean()
      if (!exam) {
        return res.locals.helpers.jsonFormat(400, 'Exam not Found')
      }
      if (answers < exam.questions.length) {
        return res.locals.helpers.jsonFormat(400, 'Invalid answers count')
      }
      let correctCount = 0
      const answerReport = [...answers]
      const answerKey = {}
      for (let row of exam.questions) {
        answerKey[row._id] = row.correct_answer
      }
      for (let row of answerReport) {
        const correct = answerKey[row.question_id] == row.option_id
        row.correct = correct
        if (answerKey[row.question_id] == undefined) {
          row.error = "Invalid Question ID"
        }

        if (correct) correctCount++
      }

      const score = correctCount / exam.questions.length * 100
      const passed = score >= exam.minimum_score

      console.log(exam.minimum_score)
      return res.locals.helpers.jsonFormat(200, 'Success submit exam', { score, passed, answerReport })
    } catch (error) {
      return res.locals.helpers.jsonFormat(500, 'error', error)
    }
  }
}