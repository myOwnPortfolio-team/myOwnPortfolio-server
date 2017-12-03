/* eslint no-console: "off", curly: "off" */

const express = require('express');
const bodyParser = require('body-parser');
const childProcess = require('child_process');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Server listening on port ${port} !`);
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
