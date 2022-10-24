const Exam = require("../../models/exam")
const mongoose = require("mongoose")
require('dotenv').config()
const randomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const run = async () => {
  const mongoConnection = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DB}`
  mongoose.connect(
    mongoConnection,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (errMongo) => {
      if (errMongo != null) {
        console.log("MONGO CONNECTION ERROR : ", errMongo)
      }
    })
  await Exam.deleteMany({})
  let exam = []
  while (exam.length <= 5) {
    let questions = []
    let qcount = exam.length == 0 ? 10 : 20
    for (let i = 0; i < qcount; i++) {
      const options = [
        { "value": "Option A" },
        { "value": "Option B" },
        { "value": "Option C" },
        { "value": "Option D" }
      ]
      questions = [...questions, {
        title: `Question ${i + 1}`,
        type: "MULTIPLE_CHOICE",
        correct_answer: options[randomInteger(0, options.length - 1)].value,
        options
      }]
    }
    exam = [...exam, {
      title: `Tryout ${exam.length + 1}`,
      description: `Tryout ${exam.length + 1} Description`,
      type: "REGULAR",
      thumbnail: "",
      duration: 120,
      membership: "GOLD",
      questions
    }]
  }

  await Exam.insertMany(exam)
  console.log("done")
}

run()