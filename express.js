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

winston.log('info', 'Loaded configuration', config);

const portfolioRoutes = portfolioActions(config);

const server = app.listen(config.server.web.port, config.server.web.host, () => {
  winston.log('info', 'Server listening', {
    date: new Date(),
    address: server.address().address,
    port: server.address().port,
  });
});

app.use('/assets', express.static(`${process.cwd()}/web/assets`));

// Server configuration
app.enable('trust proxy');

// Server routes
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use('/', express.static(`${process.cwd()}/dist/web`));
app.use(githubAuthRoutes);
app.use(portfolioRoutes);
