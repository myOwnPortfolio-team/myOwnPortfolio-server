/* eslint curly: "off" */

require('./auth/client_auth'); // WebSocket Server

const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const loadConfiguration = require('./utils/loadConfiguration');

const portfolioActions = require('./portfolio/actions');
const githubAuthRoutes = require('./auth/github_auth');


if (process.env.LOG_LEVEL) {
  winston.level = process.env.LOG_LEVEL;
} else {
  winston.level = 'debug';
}

const app = express();
const config = loadConfiguration('./config.yml');
const pwd = process.cwd();
const webDir = `${pwd}/dist/web`;
const configDir = `${pwd}/dist/config`;
const slugConfig = {
  lower: true,
  replacement: '_',
};

const portfolioRoutes = portfolioActions(
  config.host,
  config.port,
  configDir,
  webDir,
  slugConfig,
);

const server = app.listen(config.port, config.host, () => {
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
app.use(githubAuthRoutes);
app.use(portfolioRoutes);
