const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Show all tasks
router.get('/', async (req, res) => {
  const tasks = await Task.find().lean();
  res.render('tasks/list', {
    title: 'My Tasks',
    tasks
  });
});

// Show Create Task form
router.get('/create', (req, res) => {
  res.render('tasks/form', {
    title: 'Create Task',
    formAction: '/tasks/create',
    task: {}   
  });
});

// Handle Create Task
router.post('/create', async (req, res) => {
  try {
    await Task.create(req.body);
    res.redirect('/tasks');
  } catch (err) {
    res.send('Error creating task: ' + err.message);
  }
});

// Show Edit Task form
router.get('/edit/:id', async (req, res) => {
  const task = await Task.findById(req.params.id).lean();
  res.render('tasks/form', {
    title: 'Edit Task',
    formAction: `/tasks/edit/${req.params.id}`,
    task
  });
});

// Handle Edit Task
router.post('/edit/:id', async (req, res) => {
  await Task.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/tasks');
});

// Delete Task
router.get('/delete/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.redirect('/tasks');
});

module.exports = router;
