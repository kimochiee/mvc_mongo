const express = require('express')
const router = express.Router()
const User = require('../models/user.model.js')
const multer = require('multer')
const fs = require('fs')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '_' + Date.now() + '_' + file.originalname)
  }
})

const upload = multer({
  storage
}).single('image')

// api controller
router.post('/add', upload, async (req, res) => {
  try {
    await User.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename
    })

    req.session.message = {
      type: 'success',
      message: 'Add user successfully'
    }
    res.redirect('/')
  } catch (error) {
    console.log(error)
    res.json({ message: error.message, type: 'danger' })
  }
})

router.post('/update/:id', upload, async (req, res) => {
  try {
    const id = req.params.id
    let new_image = ''

    if (req.file) {
      new_image = req.file.filename

      try {
        fs.unlinkSync('./uploads/' + req.body.old_image)
      } catch (error) {
        console.log(error)
      }
    } else {
      new_image = req.body.old_image
    }

    await User.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image
      },
      { new: true }
    )

    req.session.message = {
      type: 'success',
      message: 'Update user successfully'
    }
    res.redirect('/')
  } catch (error) {
    console.log(error)
    res.json({ message: error.message, type: 'danger' })
  }
})

router.get('/delete/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    try {
      fs.unlinkSync('./uploads/' + user.image)
    } catch (error) {
      console.log(error)
    }

    await User.findByIdAndDelete(user._id)

    req.session.message = {
      type: 'success',
      message: 'Delete user successfully'
    }
    res.redirect('/')
  } catch (error) {
    console.log(error)
  }
})

// view controller
router.get('/', async (req, res) => {
  try {
    const users = await User.find()

    res.render('index.ejs', { title: 'Home page', users })
  } catch (error) {
    console.log(error)
    res.json({ message: err.message })
  }
})

router.get('/add', (req, res) => {
  res.render('add_user.ejs', { title: 'Add user' })
})

router.get('/edit/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    res.render('edit_user.ejs', { title: 'Edit user', user })
  } catch (error) {
    console.log(error)
    res.send('No user with that id')
  }
})

module.exports = router
