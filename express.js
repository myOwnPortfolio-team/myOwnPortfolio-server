/* eslint no-console: "off" */

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Server listening on port ${port} !`);
});

app.post('/portfolio', (req, res) => {
  console.log(req.body);
  res.json({ status: 1 });
});
