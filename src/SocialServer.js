/* eslint-disable prefer-arrow-callback, no-console */
const VsSocket = require('vsnet-socket');
const Protocol = require('vsnet-protocol');
const logger = require('vsnet-logger');

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
  constructor({
    port,
    secret,
    pubsub
  }) {
    logger.info('[social] Initializing server');

    if (!secret) {
      logger.warn('[social] No secret provided, connecting clients will not be verified');
    }

    this.server = new VsSocket({
      port,
      secret,
      onConnect: this.onClientConnected.bind(this),
      onDisconnect: this.onClientDisconnected.bind(this),
      pubsub: {
        ...pubsub,
        channels: [
          Channel.CHAT,
          Channel.NOTIFICATION
        ]
      },
      events: {
        [Protocol.SOCIAL_SERVER_CHAT_MESSAGE]: this.onMessageReceived.bind(this),
        [Protocol.SOCIAL_SERVER_PLAYER_ONLINE]: this.onPlayerOnline.bind(this)
      }
    });
  }

  /**
   * Client connected handler
   * Notify user of new connection
   *
   * @param {Object} socket - New socket connection
   */
  onClientConnected(socket) {
    logger.info('[social] Client connected: ' + socket.id);

    const message = {
      data: {
        type: Protocol.SOCIAL_SERVER_PLAYER_CONNECTED
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
    logger.info('[social] Client disconnected: ' + socket.id);

    const message = {
      data: {
        type: Protocol.SOCIAL_SERVER_PLAYER_DISCONNECTED
      }
    };
  }

  /**
   * Message received handler
   *
   * @param {Object} m - Message object
   * @param {Object} socket - Socket connection of originating request
   */
  onMessageReceived(m, socket) {
    logger.info('[social] Received chat message from client: ' + m.data);

    this.server.publishMessage(m, Channel.CHAT);
  }

  /**
   * Notify user or users that player is online
   *
   * @param {Object} m - Message object
   * @param {Object} socket - Socket connection of originating request
   */
  onPlayerOnline(m, socket) {
    logger.info('[social] Sending player online notification');

    this.server.publishMessage(m, Channel.NOTIFICATION);
  }

  /**
   * Start server
   *
   * @param {Function} cb - callback function
   */
  start(cb) {
    logger.info('[social] Starting server');

    try {
      this.server.start(() => {
        cb();
      });
    } catch (err) {
      logger.error('[social] Error starting server: ' + err.message);

      cb(err);
    }
  }

  /**
   * Stop server and cleanup
   *
   * @param {Function} cb - callback function
   */
  async stop(cb) {
    logger.info('[social] Stopping server');

    try {
      await this.server.stop();

      logger.info('[social] Server stopped successfully');

      if (cb) {
        cb();
      }
    } catch (err) {
      logger.error('[social] Error stopping server: ' + err.message);

      cb(err);
    }
  }
}

module.exports = SocialServer;
