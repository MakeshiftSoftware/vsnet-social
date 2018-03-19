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

class SocialManager {
  /**
   * Initialize social server.
   *
   * @param {Object} options - Server options
   */
  constructor(options) {
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
      pubsub,
      channels: [
        Channel.CHAT,
        Channel.NOTIFICATION
      ]
    });

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
    this.server.publishMessage(m, Channel.CHAT);
  }

  /**
   * Notify player's friends that player is online
   *
   * @param {Object} m - Message object
   * @param {Object} socket - Socket connection of originating request
   */
  onPlayerOnline(m, socket) {
    this.server.publishMessage(m, Channel.NOTIFICATION);
  }

  /**
   * Client connected handler
   * Notify user of new connection
   *
   * @param {Object} socket - New socket connection
   */
  onClientConnected(socket) {
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
  onClientDisconnected(socket) {  // eslint-disable-line
    // todo
  }

  /**
   * Stop server and cleanup
   *
   * @param {Function} cb - callback function
   */
  start(cb) {
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
    try {
      await this.server.stop();

      if (cb) {
        cb();
      }
    } catch (err) {
      cb(err);
    }
  }
}

module.exports = SocialManager;
