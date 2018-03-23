/* eslint-disable prefer-arrow-callback, no-console */
const VsSocket = require('./socket');

const Protocol = {
  CONNECTED: 0,
  MESSAGE: 1,
  PLAYER_ONLINE: 2
};

const Channel = {
  CHAT: 'chat',
  NOTIFICATION: 'notification'
};

class SocialServer {
  /**
   * Initialize social server.
   *
   * @param {Object} options - Server options
   */
  constructor(options) {
    console.log('[Info][social] Initializing server');

    const {
      port,
      secret,
      pubsub
    } = options;

    if (!secret) {
      console.log('[Warn][social] No secret provided, connecting clients will not be verified');
    }

    this.server = new VsSocket({
      port,
      secret,
      pubsub: {
        ...pubsub,
        channels: [
          Channel.CHAT,
          Channel.NOTIFICATION
        ]
      }
    });

    // attach handlers
    this.server.onConnect(this.onClientConnected);
    this.server.onDisconnect(this.onClientDisconnected);
    this.server.on(Protocol.MESSAGE, this.onMessageReceived);
    this.server.on(Protocol.PLAYER_ONLINE, this.onPlayerOnline);
  }

  /**
   * Message received handler
   *
   * @param {Object} m - Message object
   * @param {Object} socket - Socket connection of originating request
   */
  onMessageReceived(m, socket) {
    console.log('[Info][social] Received chat message from client:', m.data);

    this.server.publishMessage(m, Channel.CHAT);
  }

  /**
   * Notify player's friends that player is online
   *
   * @param {Object} m - Message object
   * @param {Object} socket - Socket connection of originating request
   */
  onPlayerOnline(m, socket) {
    console.log('[Info][social] Sending player online notification');

    this.server.publishMessage(m, Channel.NOTIFICATION);
  }

  /**
   * Client connected handler
   * Notify user of new connection
   *
   * @param {Object} socket - New socket connection
   */
  onClientConnected(socket) {
    console.log('[Info][social] Client connected');

    const message = {
      data: {
        type: Protocol.CONNECTED
      }
    };

    this.server.sendMessage(message, socket);
  }

  /**
   * Client disconnected handler
   * Cleanup state
   *
   * @param {Object} socket - Disconnected socket
   */
  onClientDisconnected(socket) {
    console.log('[Info][social] Client disconnected');
  }

  /**
   * Stop server and cleanup
   *
   * @param {Function} cb - callback function
   */
  start(cb) {
    console.log('[Info][social] Starting server');

    this.server.start();

    if (cb) {
      cb();
    }
  }

  /**
   * Stop server and cleanup
   *
   * @param {Function} cb - callback function
   */
  async stop(cb) {
    console.log('[Info][social] Stopping server');

    try {
      await this.server.stop();

      console.log('[Info][social] Server stopped successfully');

      if (cb) {
        cb();
      }
    } catch (err) {
      console.log('[Info][social] Error stopping server:', err.message);

      cb(err);
    }
  }
}

module.exports = SocialServer;
