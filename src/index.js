const VsServer = require('./server')

if (!process.env.PORT) {
  throw new Error('No port specified')
}

if (!process.env.SECRET) {
  throw new Error('No server secret provided')
}

if (!process.env.PUBSUB_URL) {
  throw new Error('No pubsub url provided')
}

const pubsubOpts = { url: process.env.PUBSUB_URL }

// Define server options
const serverOpts = {
  port: process.env.PORT,
  secret: process.env.SECRET,
  pingInterval: 30000,
  pubsub: pubsubOpts
}

// Create server
const server = new VsServer(serverOpts)

// Start server
server.start(() => {
  /* eslint-disable */
  process.on('SIGINT', () => {
    console.log('Graceful shutdown...')
    // perform cleanup
    process.exit(0)
  })

  console.log('Listening...')
})
