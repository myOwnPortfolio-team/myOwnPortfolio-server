/* eslint no-console: "off", curly: "off" */

const express = require('express');
const bodyParser = require('body-parser');
const childProcess = require('child_process');
const fs = require('fs-extra');
const slug = require('slug');

const app = express();
const hostname = 'localhost';
const port = 3000;
const pwd = process.cwd();
const configDir = `${pwd}/dist/config`;
const webDir = `${pwd}/dist/web`;
const slugConfig = {
  lower: true,
  replacement: '_',
};

const runDocker = (res, configName) => {
  const configPath = `${configDir}/${configName}`;
  const webPath = `${webDir}/${configName}`;
  const containerName = `core-${configName}`;
  if (fs.existsSync(webPath)) fs.removeSync(webPath);

  childProcess.exec(
    `docker run --name=${containerName} --volume ${configPath}:/root/app/json_config --volume ${webPath}:/root/dist macbootglass/myownportfolio-core`,
    (error, stdout, stderr) => {
      childProcess.exec(`docker rm ${containerName}`);

      if (error) res.json({
        status: 0,
        message: stderr,
      });
      else res.json({
        status: 1,
        message: `http://${hostname}:${port}/${configName}`,
      });
    },
  );
};

const createModuleConfiguration = (obj, path, moduleName) => {
  fs.writeJsonSync(`${path}/content/${moduleName}.json`, obj.content);
  fs.writeJsonSync(`${path}/properties/${moduleName}.json`, obj.properties);
  fs.writeJsonSync(`${path}/style/${moduleName}.json`, obj.style);
};

const createPorfolioConfiguration = (config, configName) => {
  const path = `${configDir}/${configName}`;

  if (fs.existsSync(path)) fs.removeSync(path);
  fs.mkdirsSync(path);
  fs.writeJsonSync(`${path}/app_properties.json`, config.app_properties);
  fs.mkdirsSync(`${path}/content`);
  fs.mkdirsSync(`${path}/properties`);
  fs.mkdirsSync(`${path}/style`);

  const moduleList = [];
  for (let i = 0; i < config.modules.length; i++) {
    const module = config.modules[i];
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
app.use('/', express.static(webDir));

app.listen(port, () => {
  console.log(`Server listening on port ${port} !`);
});

app.post('/portfolio', (req, res) => {
  const config = req.body;
  const configFormattedName = slug(config.name, slugConfig);

  createPorfolioConfiguration(config, configFormattedName);
  runDocker(res, configFormattedName);
});
