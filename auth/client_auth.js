const winston = require('winston');

const WebSocketServer = require('websocket').server;
const http = require('http');

const HOST = 'localhost';
const PORT = 1337;

const CLIENTS = [];

const server = http.createServer((req, res) => null);
server.listen(PORT, HOST, () => winston.log('info', 'WebSocket server listening : ', {
  date: new Date(),
  address: HOST,
  port: PORT,
}));

const wsServer = new WebSocketServer({
  httpServer: server,
});

wsServer.on('request', (request) => {
  winston.log('info', 'WebSocket connection : ', {
    date: new Date(),
    origin: request.origin,
  });

  const connection = request.accept(null, request.origin);
  const index = CLIENTS.push(connection) - 1;

  winston.log('debug', 'Connection accepted : ', {
    date: new Date(),
    origin: request.origin,
    clientIndex: index,
  });

  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      // Processing connexion workflow
      winston.log('debug', 'Message received : ', {
        date: new Date(),
        clientId: index,
        message,
      });
    }
  });

  connection.on('close', (clientConnection) => {
    winston.log('info', 'WebSocket deconnection : ', {
      date: new Date(),
      origin: clientConnection.remoteAddress,
    });

    // Remove client from list
    CLIENTS.splice(index, 1);
  });
});
