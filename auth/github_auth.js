const winston = require('winston');
const axios = require('axios');
const loadConfiguration = require('../utils/loadConfiguration');

const config = loadConfiguration('./config.yml');
const wsServer = require('./client_auth');

const express = require('express');

const router = express.Router();
const GITHUB_URL = 'https://github.com';
const GITHUB_PATH = '/login/oauth/access_token';

// Github authentication callback
// Call : https://github.com/login/oauth/authorize?scope=public_repos&client_id=CLIENT_ID
router.get('/auth/github/callback/*', (req, res) => {
  const clientIP = req.ip;
  const githubCode = req.query.code;
  const key = req.path.substr(req.path.lastIndexOf('/') + 1);
  winston.log('debug', 'Github callback :', {
    clientIP,
    githubCode,
    key,
  });

  // Close tab for user (Only result is wanted)
  res.set('Content-Type', 'text/html');
  res.sendFile(`${(process.cwd())}/web/auth_success.html`);

  // Resend temporary code to GitHub to obtain access token
  const data = {
    // client_id: 'CLIENT_ID',
    // client_secret: 'CLIENT_SECRET',
    client_id: config.client.id,
    client_secret: config.client.secret,
    code: githubCode,
  };

  axios
    .post(`${GITHUB_URL}${GITHUB_PATH}`, data)
    .then((response) => {
      const githubToken = JSON.parse(`{"${decodeURI(response.data).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"')}"}`).access_token;
      winston.log('debug', 'Github Access Token :', githubToken);

      // Send token to client
      wsServer.sendTokenToClient(key, githubToken);
      wsServer.closeConnection(key);
    });
});

module.exports = router;
