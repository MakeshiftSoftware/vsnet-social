module.exports = {
  apps: [
    {
      name: 'vsnet-social',
      script: './src/index.js',
      exec_mode: 'cluster',
      instances: 0,
      wait_ready: true,
      listen_timeout: 10000,
      env: {
        NODE_ENV: 'development',
        PUBSUB_URL: 'redis://vs-social-redis-pubsub:6379',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
}
