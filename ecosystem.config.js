module.exports = {
  apps: [
    {
      name: 'vsnet-socket',
      script: './src/example.js',
      exec_mode: 'cluster',
      instances: 0,
      wait_ready: true,
      watch: true,
      env: {
        PORT: 8000,
        NODE_ENV: 'development'
      },
      env_production: {
        PORT: 8000,
        NODE_ENV: 'production'
      }
    }
  ]
}
