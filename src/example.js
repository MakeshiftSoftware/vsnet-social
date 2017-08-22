/*
 * Demonstrating basic usage of creating a server
 * and registering a custom event with callback
 */
require('dotenv').config()

const VsServer = require('./index.js')

const PORT = process.env.PORT
const SECRET = process.env.JWT_SECRET

const server = new VsServer({
  port: PORT,
  secret: SECRET
})

server.on('c', () => {
  console.log('Received c message!')
})

server.start(() => {
  console.log('Listening...')
})
