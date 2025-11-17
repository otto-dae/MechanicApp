import express from 'express';
import cors from 'cors';
import vehiclesRouter from './routes/vehicles.js';
import sensorsRouter from "./routes/sensors.js";
import fillSensors from './scripts/sensorSim.js'; 
import reportsRouter from "./routes/reports.js";


const app = express();
const port = 3000;

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use("/vehicles", vehiclesRouter);
app.use("/reports", reportsRouter);

app.use("/sensors", sensorsRouter);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);

  fillSensors();
});