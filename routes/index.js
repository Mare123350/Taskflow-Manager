// routes/index.js
let express = require('express');
let router = express.Router();

// Home / splash page
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Task Manager',
    pageTitle: 'Welcome to Task Manager'
  });
});

module.exports = router;
