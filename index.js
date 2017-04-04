const net = require('net');

/**
 * Denotes all expected message types.
 */
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

/**
 * Expected keys for incoming and outgoing messages.
 */
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

/**
 * Data structures for storing sockets and players
 */
const players = {};
const sockets = {};

/**
 * Event handler data structure.
 * Maps event string to callback function.
 * Events registered using the on function.
 */
const eventHandler = {};

/**
 * Create and return a VS socket server.
 * Attach function for registering event callbacks
 * and attach start function.
 */
const createServer = () => {
  const vsServer = {};

  vsServer.on = on;
  vsServer.server = net.createServer(onClientConnected);;

  vsServer.start = (port) => {
    vsServer.server.listen(port, () => {
      console.log('Listening on', port);
    });
  }

  return vsServer;
}

/**
 * Callback when new client connects to socket server.
 *
 * @param {Object} socket - The socket object
 */
const onClientConnected = (socket) => {
  console.log('Client connected');
  socket.buffer = [];
  socket.bufferLen = 0;
  attachDataHandler(socket);
  attachEndHandler(socket);
  attachErrorHandler(socket);
}

/**
 * Register a callback for an event.
 *
 * @param {String} event - The name of the event
 * @param {Function} callback - The callback function
 */
const on = (event, callback) => {
  eventHandler[event] = callback;
}

/**
 * Send message through socket.
 *
 * @param {Object} socket - The socket object
 * @param {Object} msg - The parsed message object
 */
const sendMessage = (socket, msg) => {
  socket.write(JSON.stringify(msg) + '\0');
}

/**
 * Map player id to corresponding player object. 
 *
 * @param {String} playerId - The player id
 * @param {Object} player - The player object
 */
const registerPlayer = (playerId, player) => {
  players[playerId] = player;
}

/**
 * Map player id to corresponding socket object. 
 *
 * @param {String} playerId - The player id
 * @param {Object} socket - The socket object
 */
const registerSocket = (playerId, socket) => {
  sockets[playerId] = socket;
  socket.playerId = playerId;
}

/**
 * Get socket object belonging to player id. 
 *
 * @param {String} playerId - The player id
 */
const getSocket = (playerId) => {
  return sockets[playerId];
}

/**
 * Remove player and corresponding
 * socket from server by player id. 
 *
 * @param {String} playerId - The player id
 */
const removePlayer = (playerId) => {
  delete players[playerId];
  delete sockets[playerId];
}

/**
 * Get player object by player id
 *
 * @param {String} playerId - The player id
 */
const getPlayer = (playerId) => {
  return players[playerId];
}

/**
 * Message received handler.
 *
 * @param {Object} socket - The socket object
 */
const onMessage = (socket) => {
  let s = '';

  for (var i = 0; i < socket.bufferLen; ++i) {
    s += String.fromCharCode(socket.buffer[i]);
  }

  socket.bufferLen = 0;

  try {
    const msg = JSON.parse(s);

    if (msg && typeof msg === 'object') {
      processMessage(socket, msg);
    }
  } catch (e) {
    console.log(e);
  }
}

/**
 * Process received message by message type.
 *
 * @param {Object} socket - The socket object
 * @param {Object} msg - The parsed message object
 */
const processMessage = (socket, msg) => {
  const type = msg[MessageProps.TYPE];
  const callback = eventHandler[type];

  if (callback) {
    callback(socket, msg);
  }
}

/**
 * Data received handler. Process incoming bytes
 * and trigger message handler if full message is
 * received.
 *
 * @param {Object} socket - The socket object
 */
const attachDataHandler = (socket) => {
  socket.on('data', data => {
    for (var i = 0, l = data.length; i < l; ++i) {
      if (data[i] === 0) {
        onMessage(socket);
      } else {
        socket.buffer.push(data[i]);
        socket.bufferLen++;
      }
    }
  });
}

/**
 * Socket connection ended handler.
 * Perform player and socket cleanup.
 *
 * @param {Object} socket - The socket object
 */
const attachEndHandler = (socket) => {
  socket.on('end', () => {
    console.log('Client disconnected');
    removePlayer(socket.playerId);
  });
}

/**
 * Socket error handler.
 * TODO: handle this
 *
 * @param {Object} socket - The socket object
 */
const attachErrorHandler = (socket) => {
  socket.on('error', err => {
    console.log('Socket error');
  });
}

/**
 * Expose create server function.
 */
exports.createServer = createServer;

/**
 * Expose message types and message properties.
 */
exports.MessageType = MessageType;
exports.MessageProps = MessageProps;