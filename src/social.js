module.exports = (server) => {
  const sendMessage = (m) => {
    const mRecipient = m.r
    const mData = m.d

    if (mRecipient && mData) {
      server.relayMessage({
        r: mRecipient,
        d: mData
      })
    }
  }

  // Attach message handlers
  server.on('m', sendMessage)

  server.on('connected', (socket) => {
    server.sendMessage({ t: 'cs' }, socket)
  })

  server.on('disconnected', (socket) => {
    // TODO: cleanup after disconnect
  })
}

