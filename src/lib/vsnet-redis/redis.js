const Redis = require('ioredis')

class RedisClient {
  constructor(opts) {
    if (!opts) {
      throw new Error('No options specified')
    }

    if (!opts.host) {
      opts.host = '127.0.0.1'
    }

    this.client = new Redis({
      host: opts.host,
      port: opts.port
    })
  }
}

module.exports = RedisClient
