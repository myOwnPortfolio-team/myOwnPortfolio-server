const YAML = require('yamljs');
const isDocker = require('is-docker');

module.exports = (path) => {
  const configuration = YAML.load(path);
  if (isDocker()) {
    configuration.global.hostname = process.env.MOP_GLOBAL_HOSTNAME;
    configuration.global.volume = process.env.MOP_GLOBAL_VOLUME;
    configuration.client.id = process.env.MOP_CLIENT_ID;
    configuration.client.secret = process.env.MOP_CLIENT_SECRET;
  } else configuration.global.volume = `${process.cwd()}/${configuration.global.volume}`;
  return configuration;
};
