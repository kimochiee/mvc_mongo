require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')

const connectMongo = async () => {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(console.log('Connect db successfully!'))
    .catch((err) => console.error(err))
}

const start = () => {
  const app = express()
  const port = 8000

  app.use(express.urlencoded({ extended: false }))
  app.use(express.json())
  app.use(
    session({
      secret: 'supersecretkey',
      saveUninitialized: true,
      resave: false
    })
  )

  app.use((req, res, next) => {
    res.locals.message = req.session.message
    delete req.session.message
    next()
  })

  app.use(express.static('uploads'))

  app.set('view engine', 'ejs')

  app.use('/', require('./routes/routes.js'))

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

;(async () => {
  try {
    await connectMongo()

    start()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()
