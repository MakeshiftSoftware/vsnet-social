const Redis = require('ioredis')

class PubSubClient {
  constructor(url) {
    if (!url) {
      throw new Error('No connection url specified')
    }

    if (typeof url !== 'string') {
      throw new Error('Invalid type: redis url must be of type string')
    }

    console.log('Connecting to redis:', url)

    this.sub = new Redis(url)
    this.pub = new Redis(url)
  }

  subscribe(channel) {
    this.sub.subscribe(channel)
  }

  publish(channel, msg) {
    this.pub.publish(channel, msg)
  }

  on(event, cb) {
    this.sub.on(event, cb)
  }
}

module.exports = PubSubClient
