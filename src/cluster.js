const express = require('express');
const bodyParser = require('body-parser');
const usersRoutes = require('./routes/users');
const connectDB = require('./config/connectDB');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');
const cluster = require('cluster');
const os = require('os');

dotenv.config();

const numCPUs = os.cpus().length;
const isMaster = cluster.isMaster;

if (isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers equal to the number of available CPUs - 1
  for (let i = 0; i < numCPUs - 1; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  // Code to run in each worker process
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  connectDB();

  app.use(bodyParser.json());
  app.use('/api/users', usersRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  app.use(errorHandler);

  // Start the server in each worker process
  app.listen(PORT, () => {
    console.log(`Worker ${cluster.worker.id} is running on port ${PORT}`);
  });
}

