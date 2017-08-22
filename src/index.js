const url = require('url')
const qs = require('query-string')
const jwt = require('jsonwebtoken')
const WebSocket = require('uws')
const Message = require('./message')

/**
 * Default message props. To define a custom communication
 * protocol, override these by passing in option messageProps
 * to the VsServer constructor.
 */
const MessageProps = {
  TYPE: 't'
}

/**
 * Default message types. To define a custom communication
 * protocol, override these by passing in option messageTypes
 * to the VsServer constructor.
 */
const MessageTypes = {
  CHAT: 'c'
}

/**
 * Built in server messages
 */
const ServerMessage = {
  PONG: 'pong',
  MESSAGE: 'message',
  CLOSE: 'close',
  CONNECTION: 'connection'
}

/**
 * A basic socket server implementation with support for
 * custom events and backed by redis pub/sub to handle
 * message delivery in a distributed system.
 */
class VsServer {
  constructor(opts) {
    this.wssOpts = {}
    this.users = {}
    this.eventHandlers = {}
    this.messageProps = MessageProps
    this.messageTypes = MessageTypes
    this.pingInterval = 30000

    /*
     * Initialize server options
     */
    if (opts !== null && typeof opts === 'object') {
      this.setOptions(opts)
    } else {
      throw new Error('Must provide server options')
    }

    /*
     * Initialize websocket server with options
     */
    this.wss = new WebSocket.Server(this.wssOpts)

    /*
     * Attach client connected callback
     */
    this.wss.on(ServerMessage.CONNECTION, this.onClientConnected.bind(this))
  }

  /**
   * Set server options using options from constructor
   *
   * @param {Object} opts - The options object
   */
  setOptions(opts) {
    if (!opts.port) {
      throw new Error('Must specify a port to start server')
    }

    this.wssOpts.port = opts.port

    if (opts.messageProps) {
      this.messageProps = opts.messageProps
    }

    if (opts.messageTypes) {
      this.messageTypes = opts.messageTypes
    }

    if (opts.pingInterval) {
      this.pingInterval = opts.pingInterval
    }

    if (opts.secret) {
      this.secret = opts.secret
      this.wssOpts.verifyClient = this.verifyClient.bind(this)
    } else {
      console.warn('No server secret provided. Requests to connect will not be authenticated.')
    }
  }

  /**
   * Start server
   *
   * @param {Object} opts - Server options
   */
  start(cb) {
    console.log('Starting server on port', this.wssOpts.port)

    /**
     * Start heartbeat interval
     */
    setInterval(this.ping.bind(this), this.pingInterval)

    /**
     * Send ready signal to start listening
     */
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
    const userId = socket.upgradeReq.user.id
    socket.userId = userId
    socket.isAlive = true

    console.log('Client %s connected', userId)

    this.users[userId] = {
      userId: userId,
      socket: socket
    }

    socket.on(ServerMessage.PONG, this.heartbeat)
    socket.on(ServerMessage.MESSAGE, this.onMessage.bind(this))
    socket.on(ServerMessage.CLOSE, function() {
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
   * @param {String} message - The received message string
   */
  onMessage(message) {
    const msg = new Message(message)
    console.log('Received message:', msg.getData())

    const msgType = msg.getType(this.messageProps.TYPE)

    if (msgType) {
      const handler = this.eventHandlers[msgType]

      if (handler) {
        handler(msg)
      } else {
        console.warn('No handler specified for event: \'%s\'', msgType)
        console.warn('Use server.on(event, cb) to register an event')
      }
    } else {
      console.warn('Message must have a type.')
      console.warn('Expecting property \'%s\' on message', this.messageProps.TYPE)
    }
  }

  /**
   * Send a message to user by user id.
   * Because the system is distributed, the socket object may not
   * exist on this particular instance, so we need to check that the
   * socket was found before sending.
   *
   * @param {Object} msg - The message object
   * @param {String} id - The user id of recipient
   */
  sendMessage(msg, id) {
    const socket = this.getSocket(id)

    if (socket) {
      socket.send(msg.getData())
    }
  }

  /**
   * Send a message to multiple users using an array of user ids.
   * Because the system is distributed, the socket object may not
   * exist on this particular instance, so we need to check that
   * each socket was found before sending.
   *
   * @param {Object} msg - The message object
   * @param {Array} ids - The array of recipient user ids
   */
  broadcast(msg, ids) {
    ids.forEach((id) => {
      const socket = this.getSocket(id)

      if (socket) {
        socket.send(msg.getData())
      }
    })
  }

  /**
   * Register a callback for an event.
   *
   * @param {String} event - The name of the event
   * @param {Function} cb - The callback function
   */
  on(event, cb) {
    this.eventHandlers[event] = cb
  }

  /**
   * Get socket object belonging to player id.
   *
   * @param {String} id - The player id
   */
  getSocket(id) {
    return this.users[id].socket
  }
}

module.exports = VsServer
