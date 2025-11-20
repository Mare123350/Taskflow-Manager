// routes/tasks.js
// Handles all CRUD operations for Task documents

let express = require('express');
let router = express.Router();
let Task = require('../models/Task');

// protect routes for logged-in users
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error_msg', 'Please log in to access this feature');
  res.redirect('/auth/login');
}

// GET /tasks - list all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.render('tasks/list', {
      title: 'My Tasks',
      tasks
    });
  } catch (err) {
    console.error(err);
    res.render('error', { title: 'Error', message: 'Failed to load tasks' });
  }
});

// GET /tasks/create - show form
router.get('/create', ensureAuthenticated, (req, res) => {
  res.render('tasks/form', { title: 'Create Task', task: {} });
});

// POST /tasks/create - create new task
router.post('/create', ensureAuthenticated, async (req, res) => {
  try {
    await Task.create(req.body);
    req.flash('success_msg', 'Task created successfully!');
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to create task');
    res.redirect('/tasks/create');
  }
});

// GET /tasks/edit/:id - load edit form
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    res.render('tasks/form', { title: 'Edit Task', task });
  } catch (err) {
    console.error(err);
    res.redirect('/tasks');
  }
});

// POST /tasks/edit/:id - update task
router.post('/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    await Task.findByIdAndUpdate(req.params.id, req.body);
    req.flash('success_msg', 'Task updated successfully');
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to update task');
    res.redirect('/tasks');
  }
});

// POST /tasks/delete/:id - delete task
router.post('/delete/:id', ensureAuthenticated, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Task deleted');
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to delete task');
    res.redirect('/tasks');
  }
});

module.exports = router;
