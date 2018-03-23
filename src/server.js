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
  const port = process.env.PORT;
  const secret = process.env.APP_SECRET;
  const pubsub = {
    url: process.env.REDIS_PUBSUB_SERVICE,
    password: process.env.REDIS_PUBSUB_PASSWORD
  };

  // Initialize social server
  const server = new SocialServer({
    port,
    secret,
    pubsub
  });

  server.start(() => {
    process.on('SIGINT', () => {
      server.stop(stop);
    });

    process.on('SIGTERM', () => {
      server.stop(stop);
    });

    console.log('[Info][social] Server started on port', server.port);
  });
}

function stop(err) {
  console.log('[Info][social] Server stopped');

  process.exit(err ? 1 : 0);
}
