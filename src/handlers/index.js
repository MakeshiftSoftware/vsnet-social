const Protocol = {
  CONNECTED: 0,
  MESSAGE: 1,
  MESSAGE_SENT: 2
};

module.exports = (server) => {
  /**
   * Message received handler
   *
   * @param {Object} m - Message object
   * @param {Object} socket - Socket connection of originating request
   */
  function onMessageReceived(m, socket) {
    const message = {
      type: Protocol.MESSAGE_SENT,
      data: {
        id: m.id
      }
    };

    server.publishMessage(m);
    server.sendMessage(message, socket);
  }

  /**
   * Client connected handler
   * Notify user of new connection
   *
   * @param {Object} socket - New socket connection
   */
  function onClientConnected(socket) {
    const message = {
      type: Protocol.CONNECTED
    };

    server.sendMessage(message, socket);
  }

  /**
   * Client disconnected handler
   * Cleanup user's matchmaking state
   *
   * @param {Object} socket - Disconnected socket
   */
  function onClientDisconnected(socket) {
    // todo
  }

  server.on('connected', onClientConnected);
  server.on('disconnected', onClientDisconnected);
  server.on('message', onMessageReceived);
};
