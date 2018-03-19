const SocialServer = require('./SocialServer');

// Initialize social server
const server = new SocialServer({
  port: process.env.PORT,
  secret: process.env.APP_SECRET,
  pubsubUrl: process.env.REDIS_PUBSUB_URL
});

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
