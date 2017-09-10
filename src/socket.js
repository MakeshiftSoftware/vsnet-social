const url = require('url')
const qs = require('query-string')
const jwt = require('jsonwebtoken')
const WebSocket = require('uws')
const PubSubClient = require('./pubsub')

/**
 * A socket server backed by redis pub/sub
 */
class VsSocket {
  constructor(opts) {
    this.wssOpts = {}
    this.users = {}
    this.eventHandlers = {}
    this.pingInterval = 30000

    /*
     * Initialize server options
     */
    if (opts !== null && typeof opts === 'object') {
      this.setOptions(opts)
    } else {
      throw new Error('No server options provided')
    }

    /*
     * Initialize websocket server with options
     */
    this.wss = new WebSocket.Server(this.wssOpts)

    /*
     * Attach client connected callback
     */
    this.wss.on('connection', this.onClientConnected.bind(this))
  }

  /**
   * Set server options using options from constructor
   *
   * @param {Object} opts - The options object
   */
  setOptions(opts) {
    if (!opts.port) {
      throw new Error('Must specify a port')
    }

    if (!opts.secret) {
      throw new Error('No secret provided')
    }

    this.wssOpts.port = opts.port
    this.secret = opts.secret
    this.wssOpts.verifyClient = this.verifyClient.bind(this)

    if (opts.pingInterval) {
      this.pingInterval = opts.pingInterval
    }

    if (opts.pubsub && opts.pubsub.url && typeof opts.pubsub.url === 'string') {
      this.pubsub = new PubSubClient(opts.pubsub.url)
      this.pubsub.subscribe('global')
      this.pubsub.on('message', this.pubsubOnMessage.bind(this))
    } else {
      throw new Error('Missing or invalid pubsub options')
    }
  }

  /**
   * Start server
   *
   * @param {Object} opts - Server options
   */
  start(cb) {
    /**
     * Start heartbeat interval
     */
    setInterval(this.ping.bind(this), this.pingInterval)

    if (process.send) {
      process.send('ready')
    }

    if (cb) {
      cb()
    }
  }

  /**
   * Authenticate connection request using jwt
   *
   * @param {Object} info - Request data
   * @param {Function} cb - Callback function
   */
  verifyClient(info, cb) {
    const token = qs.parse(url.parse(info.req.url).search).token

    if (!token) {
      return cb(false)
    }

    jwt.verify(token, this.secret, (err, decoded) => {
      if (err) {
        cb(false)
      } else {
        info.req.user = decoded
        cb(true)
      }
    })
  }

  /**
   * Ping clients to check if they are alive and clean up severed connections
   */
  ping() {
    this.wss.clients.forEach((socket) => {
      if (socket.isAlive === false) {
        delete this.users[socket.userId]
        return socket.terminate()
      }

      socket.isAlive = true
      socket.ping('', false, true)
    })
  }

  /**
   * Heartbeat function to signal that socket is still alive
   */
  heartbeat() {
    this.isAlive = true
  }

  /**
   * Client connected handler
   *
   * @param {Object} socket - The socket object of new client
   */
  onClientConnected(socket) {
    const me = this
    const user = socket.upgradeReq.user

    if (!user || !user.id) {
      return socket.terminate()
    }

    const userId = user.id
    socket.userId = userId
    socket.isAlive = true

    console.log('Client %s connected', userId)

    this.users[userId] = {
      userId: userId,
      socket: socket
    }

    socket.on('pong', this.heartbeat)
    socket.on('message', this.onMessage.bind(this))
    socket.on('close', function() {
      me.onClientDisconnected(this.userId)
    })
  }

  /**
   * Client disconnected handler
   *
   * @param {String} userId - The user id of the disconnected client
   */
  onClientDisconnected(userId) {
    console.log('Client %s disconnected', userId)
    delete this.users[userId]
  }

  /**
   * Message received handler
   *
   * @param {String} message - The message received from client
   */
  onMessage(message) {
    console.log('Received message from client:', message)
    let m

    try {
      m = JSON.parse(message)
    } catch (e) {
      return
    }

    this.relayMessage(m)
  }

  /**
   * Publish message to other servers
   *
   * @param {Object} m - The message object
   */
  relayMessage(m) {
    this.pubsub.publish('global', JSON.stringify(m))
  }

  /**
   * Pubsub message handler. Parse incoming message
   * and relay it to intended recipients
   *
   * @param {String} channel - The sub channel
   * @param {String} message - The message metadata
   */
  pubsubOnMessage(channel, message) {
    let m

    try {
      m = JSON.parse(message)
    } catch (e) {
      return
    }

    const mRecipient = m.r
    const mData = m.d

    if (!mRecipient || !mData) {
      return
    }

    return Array.isArray(mRecipient)
      ? this.relayMulti(mData, mRecipient)
      : this.relaySingle(mData, mRecipient)
  }

  /**
   * Send a message to a single user by user id
   *
   * @param {String} mData - The message data
   * @param {String} id - The user id of recipient
   */
  relaySingle(mData, id) {
    const socket = this.getSocket(id)

    if (socket) {
      socket.send(mData)
    }
  }

  /**
   * Send a message to multiple users using an array of user ids
   *
   * @param {String} message - The message data
   * @param {Array} ids - The array of recipient user ids
   */
  relayMulti(mData, ids) {
    ids.forEach((id) => {
      const socket = this.getSocket(id)

      if (socket) {
        socket.send(mData)
      }
    })
  }

  /**
   * Get user's socket object by user id
   *
   * @param {String} id - The user id
   */
  getSocket(id) {
    if (this.users[id]) {
      return this.users[id].socket
    }
  }
}

module.exports = VsSocket
