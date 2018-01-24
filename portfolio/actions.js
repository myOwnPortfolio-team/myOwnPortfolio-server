const winston = require('winston');
const fs = require('fs-extra');
const { Router } = require('express');

const compile = require('./compile');
const github = require('../github/user');

const pwd = process.cwd();
const configPath = `${pwd}/dist/config`;

const routes = (appConfig) => {
  const router = Router();

  router.post('/portfolio', (req, res) => {
    const { token } = req.query;

    github.getUserID(token)
      .then((id) => {
        compile.createPorfolioConfiguration(req.body, appConfig, id);
        compile.runDocker(res, appConfig, req.body, id);
      })
      .catch(err => res.json({
        status: 400,
        message: err,
      }));
  });

  router.get('/portfolio', (req, res) => {
    const { token } = req.query;

    github.getUserID(token)
      .then((id) => {
        const path = `${configPath}/${id}`;

        try {
          fs.readJSON(`${path}/saved_config.json`, (err, obj) => {
            if (err) {
              res.json({
                status: 400,
                message: err,
              });
            } else {
              res.json({
                status: 200,
                message: obj,
              });
            }
          });
        } catch (error) {
          winston.log('debug', 'ERROR', error);
        }
      })
      .catch(err => res.json({
        status: 400,
        message: err,
      }));
  });

  return router;
};

module.exports = routes;
