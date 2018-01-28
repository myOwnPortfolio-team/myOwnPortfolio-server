const winston = require('winston');

const childProcess = require('child_process');
const fs = require('fs-extra');
const slug = require('slug');

const pwd = process.cwd();
const webPath = `${pwd}/dist/web`;
const configPath = `${pwd}/dist/config`;

const runDocker = (res, appConfig, config, id) => {
  const configName = slug(config.name, appConfig.slug);
  const containerName = `core-${configName}`;
  if (fs.existsSync(`${webPath}/${id}`)) fs.removeSync(`${webPath}/${id}`);

  winston.log('debug', 'Start docker');
  childProcess.exec(
    `docker run \
      --name=${containerName} \
      --volume ${appConfig.global.volume}/config/${id}:/root/app/json_config \
      --volume ${appConfig.global.volume}/web/${id}:/root/dist \
      macbootglass/myownportfolio-core`,
    (error) => {
      childProcess.exec(`docker rm ${containerName}`);
      if (error) {
        const response = {
          status: 500,
          message: error,
        };
        winston.log('error', 'Error while running docker image', response);
        res.json(response);
      } else {
        const response = {
          status: 200,
          message: `http://${appConfig.global.hostname}:${appConfig.server.web.port}/${id}`,
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

const createPorfolioConfiguration = (config, appConfig, id) => {
  const path = `${configPath}/${id}`;

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
  fs.writeJsonSync(`${path}/saved_config.json`, config);
};

module.exports = {
  createPorfolioConfiguration,
  runDocker,
};
