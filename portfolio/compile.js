const winston = require('winston');

const childProcess = require('child_process');
const fs = require('fs-extra');
const slug = require('slug');

const runDocker = (res, appConfig, config) => {
  const configName = slug(config.name, appConfig.slug);
  const configPath = `${appConfig.server.dist.config}/${configName}`;
  const webPath = `${appConfig.server.dist.web}/${configName}`;
  const containerName = `core-${configName}`;
  if (fs.existsSync(webPath)) fs.removeSync(webPath);

  childProcess.exec(
    `docker run --name=${containerName} --volume ${configPath}:/root/app/json_config --volume ${webPath}:/root/dist macbootglass/myownportfolio-core`,
    (error, stdout, stderr) => {
      childProcess.exec(`docker rm ${containerName}`);

      if (error) {
        const response = {
          status: 0,
          message: stderr,
        };
        winston.log('error', 'Error while running docker image', response);
        res.json(response);
      } else {
        const response = {
          status: 1,
          message: `http://${appConfig.global.hostname}:${appConfig.server.web.port}/${configName}`,
        };
        winston.log('info', 'Docker successfully ran', response);
        res.json(response);
      }
    },
  );
};

const createModuleConfiguration = (obj, path, moduleName) => {
  fs.writeJsonSync(`${path}/content/${moduleName}.json`, obj.content);
  fs.writeJsonSync(`${path}/properties/${moduleName}.json`, obj.properties);
  fs.writeJsonSync(`${path}/style/${moduleName}.json`, obj.style);
};

const createPorfolioConfiguration = (config, appConfig) => {
  const path = `${appConfig.server.dist.config}/${slug(config.name, appConfig.slug)}`;

  if (fs.existsSync(path)) fs.removeSync(path);
  fs.mkdirsSync(path);
  fs.writeJsonSync(`${path}/app_properties.json`, config.app_properties);
  fs.mkdirsSync(`${path}/content`);
  fs.mkdirsSync(`${path}/properties`);
  fs.mkdirsSync(`${path}/style`);

  const moduleList = [];
  for (let i = 0; i < config.modules.length; i++) {
    const module = config.modules[i];
    const formattedModuleName = slug(module.name, appConfig.slug);

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

module.exports = {
  createPorfolioConfiguration,
  runDocker,
};
