const { Router } = require('express');

const compile = require('./compile');

const routes = (appConfig) => {
  const router = Router();

  router.post('/portfolio', (req, res) => {
    compile.createPorfolioConfiguration(req.body, appConfig);
    compile.runDocker(res, appConfig, req.body);
  });

  return router;
};

module.exports = routes;
