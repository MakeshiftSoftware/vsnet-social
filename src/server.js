/* eslint-disable no-process-exit, no-console */
const os = require('os');
const cluster = require('cluster');
const SocialServer = require('./SocialServer');

if (cluster.isMaster) {
  for (let i = 0; i < os.cpus().length; ++i) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    if (!worker.exitedAfterDisconnect) {
      console.log('[Error][social] Worker has died', worker.process.pid);
      cluster.fork();
    }
  });
} else {
  // Initialize social server
  const server = new SocialServer({
    port: process.env.PORT,
    secret: process.env.APP_SECRET,
    pubsub: process.env.REDIS_PUBSUB_SERVICE
  });

  server.start(() => {
    process.on('SIGINT', () => {
      server.stop((err) => {
        process.exit(err ? 1 : 0);
      });
    });

    process.on('SIGTERM', () => {
      server.stop((err) => {
        process.exit(err ? 1 : 0);
      });
    });

    if (process.send) {
      process.send('ready');
    }

    console.log('vsnet-social: listening on', process.env.PORT);
  });
}

