const YAML = require('yamljs');
const isDocker = require('yamljs');

module.exports = (path) => {
  const configuration = YAML.load(path);
  if (isDocker()) {
    configuration.host = process.env.MOP_SERVER_HOST;
    configuration.port = process.env.MOP_SERVER_PORT;
    configuration.client.id = process.env.MOP_SERVER_CLIENT_ID;
    configuration.client.secret = process.env.MOP_SERVER_CLIENT_SECRET;
  }
  return configuration;
};
