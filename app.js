let session = require('express-session');
let flash = require('connect-flash');
let passport = require('passport');
require('./config/passport')(passport);

require('dotenv').config();
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let mongoose = require('mongoose');

// DB config
let DB = require('./config/db');

let indexRouter = require('./routes/index');
let tasksRouter = require('./routes/tasks');
let authRouter = require('./routes/auth');

let app = express();

// --- MongoDB connection ---
mongoose.connect(DB.URI);
let mongoDB = mongoose.connection;
mongoDB.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoDB.once('open', () => {
  console.log(' Connected to MongoDB');
});

// --- View engine setup ---
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// --- Middleware ---
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- Session setup ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false
  })
);

// --- Passport middleware ---
app.use(passport.initialize());
app.use(passport.session());

// --- Flash messages ---
app.use(flash());

// --- Global template variables ---
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error'); // passport
  res.locals.user = req.user || null;
  next();
});

// --- Routes ---
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/tasks', tasksRouter);

// --- 404 handler ---
app.use(function(req, res, next) {
  next(createError(404));
});

// --- Error handler ---
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error', { title: 'Error' });
});

module.exports = app;
