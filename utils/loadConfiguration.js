const YAML = require('yamljs');
const isDocker = require('is-docker');

module.exports = (path) => {
  const pwd = process.cwd();
  const configuration = YAML.load(path);
  configuration.server.dist.web = `${pwd}/${configuration.server.dist.web}`;
  configuration.server.dist.config = `${pwd}/${configuration.server.dist.config}`;
  if (isDocker()) {
    configuration.server.web.host = process.env.MOP_SERVER_WEB_HOST;
    configuration.server.web.port = process.env.MOP_SERVER_WEB_PORT;
    configuration.server.websocket.host = process.env.MOP_SERVER_WEBSOCKET_HOST;
    configuration.server.websocket.port = process.env.MOP_SERVER_WEBSOCKET_PORT;
    configuration.server.dist.webDir = process.env.MOP_SERVER_DIST_WEB;
    configuration.server.dist.configDir = process.env.MOP_SERVER_DIST_CONFIG;
    configuration.client.id = process.env.MOP_CLIENT_ID;
    configuration.client.secret = process.env.MOP_CLIENT_SECRET;
  }
  return configuration;
};
