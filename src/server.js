const VsSocket = require('./socket')

const PORT = process.env.PORT
const SECRET = process.env.SECRET

if (!PORT) {
  throw new Error('No port specified')
}

if (!SECRET) {
  throw new Error('No server secret provided')
}

const pubsubUrl = process.env.NODE_ENV === 'production'
  ? process.env.PUBSUB_URL_PROD
  : process.env.PUBSUB_URL_DEV

if (!pubsubUrl) {
  throw new Error('No redis connection url provided')
}

const pubsubOpts = { url: pubsubUrl }

// Define server options
const serverOpts = {
  port: PORT,
  secret: SECRET,
  pingInterval: 30000,
  pubsub: pubsubOpts
}

// Create server
const server = new VsSocket(serverOpts)

// Start server
server.start(() => {
  /* eslint-disable */
  process.on('SIGINT', () => {
    process.exit(0)
  })

  console.log('Listening on', PORT)
})
