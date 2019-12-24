const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/users.model')

// Passport.serializeUser
passport.serializeUser((user, done) => {
    done(null, user.id)
})

// Passport.deserializeUser
passport.deserializeUser( async (id, done) => {
    try {
        const user = await User.findById(id)
        done(null, user)

    } catch(error) {
        done(error, null)
    }
})

// Passport.use(...)
passport.use( 'local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: false
}, async (email, password, done) => {
    try {
    // Check if the email exists in the database
        const user = await User.findOne({ 'email': email })
        console.log(user)
        if(!user) {
            return done(null, false, { message: 'email not registered' })

        }

    // Check if the password is correct
        console.log(password)
        const isValid = await User.comparePasswords(password, user.password)
        console.log(password)
        console.log(isValid)

        if(isValid) {
            return done(null, user)

        } else {
            return done(null, false, { message: 'Password incorrect' })

        }

    } catch(error) {
        return done(error, false)

    }
}))