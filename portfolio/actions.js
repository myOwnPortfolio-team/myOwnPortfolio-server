const slug = require('slug');
const express = require('express');

const compile = require('./compile');

const routes = (hostname, port, configDir, webDir, slugConfig) => {
  const router = express.Router();

  router.post('/portfolio', (req, res) => {
    const config = req.body;
    const configFormattedName = slug(config.name, slugConfig);

    compile.createPorfolioConfiguration(
      config,
      configDir,
      configFormattedName,
      slugConfig,
    );
    compile.runDocker(
      res,
      hostname,
      port,
      webDir,
      configDir,
      configFormattedName,
    );
  });

  return router;
};

module.exports = routes;
