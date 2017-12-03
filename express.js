/* eslint no-console: "off", curly: "off" */

const express = require('express');
const bodyParser = require('body-parser');
const childProcess = require('child_process');
const fs = require('fs-extra');
const slug = require('slug');

const app = express();
const port = 3000;
const slugConfig = {
  lower: true,
  replacement: '_',
};

const runDocker = (res) => {
  childProcess.exec(
    'docker run macbootglass/myownportfolio-core sleep 0.5 && echo "done"',
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
};

const createModuleConfiguration = (obj, path) => {
  const formattedModuleName = slug(obj.name, slugConfig);
  fs.writeJsonSync(`${path}/content/${formattedModuleName}.json`, obj.content);
  fs.writeJsonSync(`${path}/properties/${formattedModuleName}.json`, obj.properties);
  fs.writeJsonSync(`${path}/style/${formattedModuleName}.json`, obj.style);
};

const createPorfolioConfiguration = (conf) => {
  const path = `./dist/${slug(conf.name, slugConfig)}`;
  if (fs.existsSync(path)) fs.removeSync(path);
  fs.mkdirsSync(path);
  fs.mkdirsSync(`${path}/content`);
  fs.mkdirsSync(`${path}/properties`);
  fs.mkdirsSync(`${path}/style`);

  conf.modules.forEach(obj => createModuleConfiguration(obj, path));
};

app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Server listening on port ${port} !`);
});

app.post('/portfolio', (req, res) => {
  createPorfolioConfiguration(req.body);
  runDocker(res);
});
