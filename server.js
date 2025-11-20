let http = require('http');
let app = require('./app');

let port = process.env.PORT || 3000;
app.set('port', port);

let server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
