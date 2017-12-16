const express = require('express');
const fs = require('fs-extra');

const compile = require('./compile');
const github = require('../github/user');

const routes = (hostname, port, configDir, webDir, slugConfig) => {
  const router = express.Router();

  router.post('/portfolio', (req, res) => {
    const config = req.body;
    const queryParams = req.query;

    if (queryParams.token !== undefined) {
      const { token } = queryParams;

      github.getUserID(token)
        .then((id) => {
          const path = `${configDir}/${id}`;

          compile.createPorfolioConfiguration(
            config,
            path,
            slugConfig,
          );

          compile.runDocker(
            res,
            hostname,
            port,
            webDir,
            configDir,
            id,
          );
        })
        .catch(err => res.json({
          status: 400,
          message: err,
        }));
    }
  });

  router.get('/portfolio', (req, res) => {
    const queryParams = req.query;

    let token;
    if (queryParams.token !== undefined) {
      ({ token } = queryParams);

      github.getUserID(token)
        .then((id) => {
          const path = `${configDir}/${id}`;
          fs.readJSONSync(`${path}/saved_config.json`, (err, obj) => {
            if (err) {
              res.json({
                status: 400,
                message: err,
              });
            }

            res.json({
              status: 200,
              message: obj,
            });
          });
        })
        .catch(err => res.json({
          status: 400,
          message: err,
        }));
    }
  });

  return router;
};

module.exports = routes;
