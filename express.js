/* eslint curly: "off" */

require('./auth/client_auth'); // WebSocket Server

const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const portfolioActions = require('./portfolio/actions');
const githubAuthRoutes = require('./auth/github_auth');

if (process.env.LOG_LEVEL) {
  winston.level = process.env.LOG_LEVEL;
} else {
  winston.level = 'debug';
}

const app = express();
const hostname = 'localhost';
const port = 3000;
const pwd = process.cwd();
const webDir = `${pwd}/dist/web`;
const configDir = `${pwd}/dist/config`;
const slugConfig = {
  lower: true,
  replacement: '_',
};

const portfolioRoutes = portfolioActions(
  hostname,
  port,
  configDir,
  webDir,
  slugConfig,
);

const server = app.listen(port, hostname, () => {
  winston.log('info', 'Server listening', {
    date: new Date(),
    address: server.address().address,
    port: server.address().port,
  });
});

// Server configuration
app.enable('trust proxy');

// Server routes
app.use(bodyParser.json());
app.use('/', express.static(webDir));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(githubAuthRoutes);
app.use(portfolioRoutes);
