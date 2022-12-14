const mongoose = require('mongoose')

const optionsSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true
  },
  image: String
})
const questionSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: {
    type: String,
    default: "MULTIPLE_CHOICE"
  },
  image: String,
  options: {
    type: [optionsSchema],
    validate: {
      validator: v => Array.isArray(v) && v.length >= 2,
      message: `Options must be greater than 1!`
    },
  },
  correct_answer: mongoose.Schema.Types.Mixed
})

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    default: "REGULAR"
  },
  category: {
    type: String,
    default: "GENERAL"
  },
  minimum_score: {
    type: Number,
    default: 60
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: v => Array.isArray(v) && v.length > 0,
      message: `Questions cannot be empty!`
    },
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  thumbnail: String,
  updated_at: Date,
  duration: Number,
  membership: String,
  limit: String
});

examSchema.pre("save", function (next) {
  const exam = this
  if (this.isNew) {
    for (let row of exam.questions) {
      const ansID = row.options.find(({ value }) => value === row.correct_answer);
      row.correct_answer = ansID == undefined ? row.options[0]._id : ansID._id
    }
    next()
  } else {
    return next()
  }
})
examSchema.pre("insertMany", function (next, docs) {
  for (let exam of docs) {
    for (let row of exam.questions) {
      row.options = row.options.map(item => ({ _id: new mongoose.Types.ObjectId(), value: item }))
      const ansID = row.options.find(({ value }) => value === row.correct_answer);
      row.correct_answer = ansID == undefined ? row.options[0]._id : ansID._id
    }
  }
  next()
})
const ExamModel = mongoose.model('exams', examSchema);

module.exports = ExamModel;