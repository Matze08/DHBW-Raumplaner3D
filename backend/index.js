const express = require('express')

console.log("INFO | Starting Raumplaner-Backend...")
const app = express()
const port = 3187

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`INFO | Raumplaner-Backend listening on port ${port}`)
})
