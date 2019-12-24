const express = require('express');
const router = express.Router();
const Joi = require('joi')
const passport = require('passport')
const User = require('../models/users.model')

const userSchema = Joi.object().keys({
  email: Joi.string().email().required(), 
  username: Joi.string().required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
  confirmationPassword: Joi.any().valid(Joi.ref('password')).required()
})

// User IsAuthenticated
const isAuthenticated = (req, res, next) => {
  if(req.isAuthenticated()) {
    // good
    return next()
  } else {
    req.flash('error', 'sorry you must be logged in to see this page')
    res.redirect('/')
  }
}

// User is not Authenticated
const isNotAuthenticated = (req, res, next) => {
  if(req.isAuthenticated()) {
    req.flash('error', 'You are already logged in')
    res.redirect('/')
  } else {
    return next()
  }
}

router.route('/register')
  .get(isNotAuthenticated, (req, res) => {
    res.render('register');
  })
  .post( async (req, res, next) => {
      try {
        // console.log('req.body: ',req.body)
        const result = Joi.validate(req.body, userSchema)
        // console.log('result', result)
        if(result.error) {
          req.flash('Error', 'data is not valid')
          res.redirect('/users/register')
          return
        }

        // Check if email is taken
        const user = await User.findOne({ 'email': result.value.email })
        if(user) {
          req.flash('error', 'Email is already taken')
          res.redirect('users/register')
          return
        }

        // Hash the password 
        const hash = await User.hashPassword(result.value.password)
        // console.log('Hash', hash)

        // Save the user to the database
        delete result.value.confirmationPassword
        result.value.password = hash
        // console.log('newVals', result.value)
        const newUser = new User(result.value)
        console.log('newUser:', newUser)

        await newUser.save()
        req.flash('successful sign up', 'Please login')
        res.redirect('/users/login')

      } catch(err) {
          next(err)
    } 
  })

router.route('/login')
  .get(isNotAuthenticated, (req, res) => {
    res.render('login');
  })
  .post(passport.authenticate('local', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  }))

router.route('/dashboard')
  .get(isAuthenticated, (req, res) => {
    console.log('req.user', req.user)

    res.render('dashboard', {
      username: req.user.username
    })
  })

router.route('/logout')
  .get(isAuthenticated, (req, res) => {
    req.logout()
    req.flash('success', 'You have been logged out')
    res.redirect('/')
  })

module.exports = router;