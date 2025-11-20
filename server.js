const app = require('./app');

// Render provides a PORT in process.env.PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
