/* eslint no-console: "off", curly: "off" */

const express = require('express');
const bodyParser = require('body-parser');
const childProcess = require('child_process');
const fs = require('fs-extra');
const slug = require('slug');

const app = express();
const port = 3000;
const configDir = './dist/config';
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

const createModuleConfiguration = (obj, path, moduleName) => {
  fs.writeJsonSync(`${path}/content/${moduleName}.json`, obj.content);
  fs.writeJsonSync(`${path}/properties/${moduleName}.json`, obj.properties);
  fs.writeJsonSync(`${path}/style/${moduleName}.json`, obj.style);
};

const createPorfolioConfiguration = (conf) => {
  const path = `${configDir}/${slug(conf.name, slugConfig)}`;
  if (fs.existsSync(path)) fs.removeSync(path);
  fs.mkdirsSync(path);
  fs.writeJsonSync(`${path}/app_properties.json`, conf.app_properties);
  fs.mkdirsSync(`${path}/content`);
  fs.mkdirsSync(`${path}/properties`);
  fs.mkdirsSync(`${path}/style`);

  const moduleList = [];
  for (let i = 0; i < conf.modules.length; i++) {
    const module = conf.modules[i];
    const formattedModuleName = slug(module.name, slugConfig);

    createModuleConfiguration(module, path, formattedModuleName);
    moduleList.push({
      name: module.name,
      module_path: `./modules/${module.type}/index.jsx`,
      content_path: `./json_config/content/${formattedModuleName}.json`,
      properties_path: `./json_config/properties/${formattedModuleName}.json`,
      style_path: `./json_config/style/${formattedModuleName}.json`,
      referenced: module.referenced,
    });
  }
  fs.writeJsonSync(`${path}/module_list.json`, moduleList);
};

app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Server listening on port ${port} !`);
});

app.post('/portfolio', (req, res) => {
  createPorfolioConfiguration(req.body);
  runDocker(res);
});
