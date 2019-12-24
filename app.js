const express = require('express');
const morgan = require('morgan')
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose')
const passport = require('passport')

require('dotenv').config()
require('./config/passport')

const app = express();
app.use(morgan('dev'));

const port = process.env.PORT || 5000
const uri = process.env.ATLAS_URI;

// MONGO-DB/MONGOOSE
mongoose.connect(uri, { useNewUrlParser:true, useCreateIndex:true, useUnifiedTopology: true} )
.catch(error => console.log(error))

const connection = mongoose.connection;

connection.once('open', () => {
    console.log('MongoDB database has been established successfully')
})

mongoose.set('useFindAndModify', false)

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', expressHandlebars({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');
      
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  cookie: { maxAge: 60000 },
  secret: 'codeworkrsecret',
  saveUninitialized: false,
  resave: false
}));

app.use(passport.initialize())
app.use(passport.session())

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success')
  res.locals.error_messages = req.flash('error')
  res.locals.isAuthenticated = req.user ? true : false
  next()
})

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.render('notFound');
});

app.listen(port, () => console.log(`Server started listening on port: ${port}`));