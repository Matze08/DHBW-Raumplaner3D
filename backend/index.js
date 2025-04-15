const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
const app = express()
const port = 3000

app.use(express.static(path.join(__dirname, '../')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

console.log("INFO | Starting Raumplaner-Backend...")


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/root.html'));
})

app.listen(port, () => {
  console.log(`INFO | Raumplaner-Backend listening on port ${port}`)
})
