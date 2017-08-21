const express = require('express')
const http = require('http')
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

class VsServer {
  constructor(opts) {
    opts = opts || {}
    this.sockets = {}
    this.eventHandlers = {}
    this.MessageProps = MessageProps
    this.MessageTypes = MessageTypes
    this.server = http.createServer(express())

    const wssOpts = {
      server: this.server
    }

    if (opts.messageProps) {
      this.MessageProps = opts.messageProps
    }

    if (opts.messageTypes) {
      this.MessageTypes = opts.messageTypes
    }

    if (opts.secret) {
      this.secret = opts.secret
      wssOpts.verifyClient = this.verifyClient.bind(this)
    } else {
      console.warn('No secret specified. Incoming connection requests will not be authenticated.')
    }

    const wss = new WebSocket.Server(wssOpts)

    wss.on('connection', this.onClientConnected.bind(this))
  }

  /**
   * Start server
   *
   * @param {Object} opts - Server options
   */
  start(opts, cb) {
    if (!opts.port) {
      throw new Error('Must specify a port to start server')
    }

    this.server.listen(opts.port, () => {
      console.log('Listening on port', opts.port)
      process.send('ready')

      if (cb) {
        cb()
      }
    })
  }

  /**
   * Authenticate connection request using jwt
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
   * Client connected handler
   *
   * @param {Object} socket - The socket object of new client
   */
  onClientConnected(socket) {
    const userId = socket.upgradeReq.user.id
    console.log('Client connected with id', userId)
    socket.on('message', this.onMessage.bind(this))
    socket.send('something')
  }

  /**
   * Message received handler
   *
   * @param {String} message - The received message string
   */
  onMessage(message) {
    const msg = new Message(message)
    console.log('Received message:', msg.getData())

    const msgType = msg.getType(this.MessageProps.TYPE)

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
      console.warn('Expecting property \'%s\' on message', this.MessageProps.TYPE)
    }
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
    return this.sockets[id]
  }

  /**
   * Set message props
   *
   * @param {Object} props - Message props to set
   */
  setMessageProps(props) {
    this.MessageProps = props
  }

  /**
   * Set message types
   *
   * @param {Object} types - Message types to set
   */
  setMessageTypes(types) {
    this.MessageTypes = types
  }
}

module.exports = VsServer
