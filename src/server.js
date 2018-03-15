const SocialManager = require('./core/SocialManager');

// Initialize social manager
const server = new SocialManager();

server.start(() => {
  process.on('SIGINT', () => {
    server.stop((err) => {
      process.exit(err ? 1 : 0);  // eslint-disable-line
    });
  });

  if (process.send) {
    process.send('ready');
  }

  console.log('vsnet-social: listening on', process.env.PORT); // eslint-disable-line
});
