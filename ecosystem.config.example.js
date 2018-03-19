module.exports = {
  apps: [
    {
      name: 'vsnet-social',
      script: './src/server.js',
      exec_mode: 'cluster',
      instances: 0,
      wait_ready: true,
      env: {
        NODE_ENV: 'development',
        PORT: 8000,
        APP_SECRET: 'SECURE_JWT_SECRET',
        REDIS_PUBSUB_URL: 'redis://vsnet-social-pubsub:6379'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8000,
        APP_SECRET: 'SECURE_JWT_SECRET',
        REDIS_PUBSUB_URL: 'redis://vsnet-social-pubsub:6379'
      }
    }
  ]
};
