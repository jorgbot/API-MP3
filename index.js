const express = require('express');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors')
const routes = require('./routes/routes')
const bodyParser = require('body-parser')
const path = require('path')


const app = express();

// use views folder as static folder
app.use(express.static(path.resolve(__dirname,'views')));

// Allow Cross-Origin requests
app.use(cors());

// to support JSON-encoded bodies
app.use( bodyParser.json());  

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({   
  extended: true
}));

// Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Routes
app.use(routes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, err => {
    if (err) {
      return console.error(err);
    }
    return console.log(`server is listening on ${port}`);
  });