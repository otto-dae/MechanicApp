import express from 'express'
import vehiclesRouter from './routes/vehicles.js'

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use("/vehicles", vehiclesRouter)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})