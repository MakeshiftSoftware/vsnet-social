/* eslint-disable no-process-exit */
const os = require('os');
const cluster = require('cluster');
const logger = require('vsnet-logger');
const SocialServer = require('./SocialServer');

const {
  PORT,
  APP_SECRET,
  REDIS_PUBSUB_SERVICE,
  REDIS_PUBSUB_PASSWORD
} = process.env;

if (cluster.isMaster) {
  for (let i = 0; i < os.cpus().length; ++i) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    if (!worker.exitedAfterDisconnect) {
      logger.error('[social] Worker has died: ' + worker.process.pid);

      cluster.fork();
    }
  });
} else {
  // Initialize social server
  const server = new SocialServer({
    port: PORT,
    secret: APP_SECRET,
    pubsub: {
      url: REDIS_PUBSUB_SERVICE,
      password: REDIS_PUBSUB_PASSWORD
    }
  });

  server.start(() => {
    process.on('SIGINT', () => {
      server.stop(stop);
    });

    process.on('SIGTERM', () => {
      server.stop(stop);
    });
  });
}

function stop(err) {
  process.exit(err ? 1 : 0);
}
