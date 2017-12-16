const YAML = require('yamljs');
const isDocker = require('is-docker');

module.exports = (path) => {
  const configuration = YAML.load(path);
  if (isDocker()) {
    configuration.server.web.host = process.env.MOP_SERVER_WEB_HOST;
    configuration.server.web.port = process.env.MOP_SERVER_WEB_PORT;
    configuration.server.websocket.host = process.env.MOP_SERVER_WEBSOCKET_HOST;
    configuration.server.websocket.port = process.env.MOP_SERVER_WEBSOCKET_PORT;
    configuration.client.id = process.env.MOP_CLIENT_ID;
    configuration.client.secret = process.env.MOP_CLIENT_SECRET;
  }
  return configuration;
};
