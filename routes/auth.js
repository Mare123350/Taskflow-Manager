// routes/auth.js
let express = require('express');
let router = express.Router();
let passport = require('passport');
let User = require('../models/User');

// GET register
router.get('/register', (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    errors: [],
    name: '',
    email: ''
  });
});

// POST register
router.post('/register', async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }

  if (errors.length > 0) {
    return res.render('auth/register', {
      title: 'Register',
      errors,
      name,
      email
    });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      errors.push({ msg: 'Email is already registered' });
      return res.render('auth/register', {
        title: 'Register',
        errors,
        name,
        email
      });
    }

    const user = new User({ name, email, password });
    await user.save();

    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Something went wrong');
    res.redirect('/auth/register');
  }
});

// GET login
router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

// POST login
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/tasks',
    failureRedirect: '/auth/login',
    failureFlash: true
  })
);

// GET logout
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth/login');
  });
});

module.exports = router;
