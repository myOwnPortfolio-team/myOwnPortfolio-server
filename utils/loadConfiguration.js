const YAML = require('yamljs');
const isDocker = require('is-docker');

module.exports = (path) => {
  const configuration = YAML.load(path);
  if (isDocker()) {
    configuration.global.hostname = process.env.MOP_GLOBAL_HOSTNAME;
    configuration.global.dist = process.env.MOP_GLOBAL_DIST;
    configuration.client.id = process.env.MOP_CLIENT_ID;
    configuration.client.secret = process.env.MOP_CLIENT_SECRET;
  } else configuration.global.dist = `${process.cwd()}/${configuration.global.dist}`;
  configuration.server.dist.config = `${configuration.global.dist}/${configuration.server.dist.config}`;
  configuration.server.dist.web = `${configuration.global.dist}/${configuration.server.dist.web}`;
  return configuration;
};
