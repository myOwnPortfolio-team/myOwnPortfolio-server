const winston = require('winston');

const WebSocketServer = require('websocket').server;
const http = require('http');
const loadConfiguration = require('../utils/loadConfiguration');

const config = loadConfiguration('./config.yml');
console.log(config);

const HOST = 'localhost';
const PORT = 1337;
const SERVER_PORT = 3000;
const CLIENT_ID = process.env.MOP_SERVER_CLIENT_ID;

const noClientIDError = () => 'No client id defined. Please set the "MOP_SERVER_CLIENT_ID" environment variable.';

class MOPWebSocketServer {
  constructor(host, port, serverPort, clientID) {
    this.host = host;
    this.port = port;
    this.serverPort = serverPort;
    this.clientID = clientID;
    this.clients = {};

    if (this.clientID === undefined) {
      throw noClientIDError();
    }

    this.server = http.createServer(() => null);
    this.server.listen(PORT, HOST, () => winston.log('info', 'WebSocket server listening : ', {
      date: new Date(),
      address: HOST,
      port: PORT,
    }));
    this.wsServer = new WebSocketServer({
      httpServer: this.server,
    });

    const server = this;
    this.wsServer.on('request', (request) => {
      winston.log('info', 'WebSocket connection : ', {
        date: new Date(),
        origin: request.origin,
      });

      const connection = request.accept(null, request.origin);

      // Generate random ID and register client
      const key = server.generateRandomKey();
      server.clients[key] = connection;

      winston.log('debug', 'Connection accepted : ', {
        date: new Date(),
        origin: request.origin,
        clientKey: key,
      });

      // Send key to client
      connection.sendUTF(JSON.stringify({
        action: 'key',
        key,
      }));

      connection.on('message', (message) => {
        if (message.type === 'utf8') {
          // Processing connexion workflow
          winston.log('debug', 'Message received : ', {
            date: new Date(),
            clientKey: key,
            message: JSON.parse(message.utf8Data),
          });
          server.processMessage(connection, JSON.parse(message.utf8Data));
        }
      });

      connection.on('close', (clientConnection) => {
        winston.log('info', 'WebSocket deconnection : ', {
          date: new Date(),
          origin: clientConnection.remoteAddress,
        });

        // Remove client from list
        server.removeClient(key);
      });
    });
  }

  processMessage(connection, message) {
    switch (message.action) {
      case 'auth_link':
        if (message.key in this.clients) {
          connection.sendUTF(JSON.stringify({
            action: 'auth_link',
            authLink: 'https://github.com/login/oauth/authorize' +
              `?client_id=${this.clientID}&scope=public_repo%20read:user` +
              `&redirect_uri=http://${this.host}:${this.serverPort}/auth/github/callback/${message.key}`,
          }));
        } else {
          connection.sendUTF(JSON.stringify({
            action: 'client_id_error',
            error: 'Unknown client key.',
          }));
        }
        break;
      default:
    }
  }

  generateRandomKey() {
    let key;
    do {
      key = (Math.random() + 1).toString(36).substr(2) +
        ((Math.sin(Math.random()) * 100) + 1).toString(36).substr(3);
    } while (key in this.clients);
    return key;
  }

  sendTokenToClient(key, accessToken) {
    if (key in this.clients) {
      this.clients[key].sendUTF(JSON.stringify({
        action: 'access_token',
        accessToken,
      }));
    }
  }

  removeClient(key) {
    if (key in this.clients) {
      delete this.clients[key];
    }
  }

  closeConnection(key) {
    if (key in this.clients) {
      this.clients[key].close();
      this.removeClient(key);
    }
  }
}

module.exports = new MOPWebSocketServer(HOST, PORT, SERVER_PORT, CLIENT_ID);
