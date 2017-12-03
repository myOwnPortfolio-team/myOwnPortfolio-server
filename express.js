/* eslint curly: "off" */

const express = require('express');
const bodyParser = require('body-parser');
const childProcess = require('child_process');
const winston = require('winston');

if (process.env.LOG_LEVEL) {
  winston.level = process.env.LOG_LEVEL;
}

const app = express();
const host = 'localhost';
const port = 3000;

app.use(bodyParser.json());

const server = app.listen(port, host, () => {
  winston.log('info', 'Server listening : ', {
    address: server.address().address,
    port: server.address().port,
  });
});

app.post('/portfolio', (req, res) => {
  childProcess.exec(
    'docker run macbootglass/myownportfolio-core sleep 5 && echo "done"',
    (error, stdout, stderr) => {
      if (error) res.json({
        status: 0,
        message: stderr,
      });
      else res.json({
        status: 1,
        message: stdout,
      });
    },
  );
});
