const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const helperUtils = require('./app/utils/helper')
const productRouter = require('./routes/v1/product')
const mongoose = require('mongoose')
require('dotenv').config()

// mongo configuration
const mongoConnection = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DB}`
mongoose.connect(
  mongoConnection,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (errMongo) => {
    if (errMongo != null) {
      console.log("MONGO CONNECTION ERROR : ", errMongo)
    }
  })

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false, limit: '100mb' }))

// parse application/json
app.use(bodyParser.json({ limit: '100mb' }))

app.use((req, res, next) => {
  res.locals.helpers = {
    jsonFormat: (httpCode, message, data = []) => {
      return res.status(httpCode).json({
        meta: {
          status: httpCode,
          message,
        },
        data
      })
    },
    ...helperUtils
  }
  next()
})

app.use('/api/v1', productRouter)

app.get('/404', function (req, res, next) {
  next();
});

app.get('/403', function (req, res, next) {
  // trigger a 403 error
  var err = new Error('not allowed!');
  err.code = 403;
  next(err);
});

app.get('/500', function (req, res, next) {
  // trigger a generic (500) error
  next({ message: 'Something went wrong' });
});

app.use(function (req, res, next) {
  next({ message: 'Url not found', code: 404 })
});

app.use(function (err, req, res, next) {
  if (res.locals.helpers == undefined) {
    console.error(err)
    return res.status(500).json({ message: "something went wrong" })
  } else {
    return res.locals.helpers.jsonFormat(err.code || 500, err.message)
  }
});

app.listen(process.env.PORT, () => {
  console.log("------------------------------------------------------")
  console.log(`Mongo service running at http://localhost:${process.env.PORT}`)
  console.log("------------------------------------------------------")
})
