const net = require('net');

// Message types
const MessageType = {
  CONNECT: 1,
  CONNECTED: 2,
  NOTIFY_ONLINE: 3,
  CHAT: 4,
  QUEUE: 5,
  RETRY: 6,
  MATCH: 7,
  INVITE: 8,
  NO_MATCH: 9,
  JOIN: 10,
  LOAD_LEVEL: 11,
  LEVEL_LOADED: 12,
  START_GAME: 13,
  PLAYER_INPUT: 14
}

// Message properties
const MessageProps = {
  TYPE: 'c',
  PLAYER:'p',
  FRIENDS: 'f',
  RECIPIENT: 'r',
  MESSAGE: 'm',
  RANK: 's',
  RECIPIENTS: 't',
  USERNAME: 'u',
  GAME: 'g'
}

const players = {};
const sockets = {};
const eventHandler = {};

class VSSocket {

  constructor(callback) {
    this.server = net.createServer(VSSocket.onClientConnected);
  }

  on(event, callback) {
    eventHandler[event] = callback;
  }

  sendMessage(socket, msg) {
    socket.write(JSON.stringify(msg) + '\0');
  }

  registerPlayer(playerId, player) {
    players[playerId] = player;
  }

  registerSocket(playerId, socket) {
    sockets[playerId] = socket;
    socket.playerId = playerId;
  }

  getSocket(playerId) {
    return sockets[playerId];
  }

  removePlayer(playerId) {
    delete players[playerId];
  }

  removeSocket(socket) {
    delete sockets[socket.playerId];
  }

  getPlayer(playerId) {
    return players[playerId];
  }

  listen(port) {
    this.server.listen(port, () => {
      console.log('Listening on', port);
    });
  }

  static onClientConnected(socket) {
    console.log('Client connected');
    socket.buffer = [];
    socket.bufferLen = 0;
    VSSocket.attachDataHandler(socket);
    VSSocket.attachEndHandler(socket);
    VSSocket.attachErrorHandler(socket);
  }

  static onMessage(socket) {
    let s = '';

    for (var i = 0; i < socket.bufferLen; ++i) {
      s += String.fromCharCode(socket.buffer[i]);
    }

    socket.bufferLen = 0;

    try {
      const msg = JSON.parse(s);

      if (msg && typeof msg === 'object') {
        this.processMessage(socket, msg);
      }
    } catch (e) {
      console.log(e);
    }
  }

  static processMessage(socket, msg) {
    const type = msg[MessageProps.TYPE];
    const callback = eventHandler[type];

    if (callback) {
      callback(socket, msg);
    }
  }

  static attachDataHandler(socket) {
    socket.on('data', data => {
      for (var i = 0, l = data.length; i < l; ++i) {
        if (data[i] === 0) {
          this.onMessage(socket);
        } else {
          socket.buffer.push(data[i]);
          socket.bufferLen++;
        }
      }
    });
  }

  static attachEndHandler(socket) {
    socket.on('end', () => {
      console.log('Client disconnected');
      removeSocket(socket);
      removePlayer(socket.playerId);
    });
  }

  static attachErrorHandler(socket) {
    socket.on('error', err => {
      console.log('Socket error');
      // TODO: handle socket error
    });
  }
}

exports.createServer = () => {
  return new VSSocket();
}

exports.MessageType = MessageType;
exports.MessageProps = MessageProps;