const Events = {
  CLIENT_CONNECTED: 'connected',
  MESSAGE_RECEIVED: 'm'
};

const Messages = {
  CONNECTION_ESTABLISHED: {
    t: 'cs'
  }
};

module.exports = (server) => {
  server.on(Events.CLIENT_CONNECTED, (m, socket) => {
    server.sendMessage(Messages.CONNECTION_ESTABLISHED, socket);
  });

  server.on(Events.MESSAGE_RECEIVED, (m, socket) => {
    server.publishMessage(m);
  });
};
