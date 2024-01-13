const express = require("express");
const bodyParser = require("body-parser");
const usersRoutes = require("./routes/users");
const connectDB = require("./config/connectDB");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/errorHandler");
const cluster = require("cluster");
const os = require("os");

dotenv.config();

const numCPUs = os.cpus().length;
const isMaster = cluster.isMaster;

if (isMaster) {
  console.log(`Master ${process.pid} is running`);
  const workerIds = [];
  let nextWorkerIndex = 0;

  // Fork workers equal to the number of available CPUs - 1
  for (let i = 0; i < numCPUs - 1; i++) {
    const worker = cluster.fork();
    workerIds.push(worker.id);
  }

  // Listen for messages from workers
  cluster.on("message", (worker, message) => {
    if (message.cmd && message.cmd === "request") {
      // Forward the request to the next worker using round-robin
      const nextWorkerId = workerIds[nextWorkerIndex];
      cluster.workers[nextWorkerId].send({
        cmd: "request",
        data: message.data,
      });
      nextWorkerIndex = (nextWorkerIndex + 1) % workerIds.length;
    }
  });

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    const index = workerIds.indexOf(worker.id);
    if (index !== -1) {
      workerIds.splice(index, 1);
    }
    const newWorker = cluster.fork();
    workerIds.push(newWorker.id);
  });
} else {
  // Code to run in each worker process
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === "production";

  // Log when a request is received by each worker
  app.use((req, res, next) => {
    console.log(`Worker ${cluster.worker.id} is handling a request`);
    next();
  });

  connectDB();

  app.use(bodyParser.json());
  app.use("/api/users", usersRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
  });

  app.use(errorHandler);

  // Start the server in each worker process
  app.listen(PORT, () => {
    console.log(`Worker ${cluster.worker.id} is running on port ${PORT}`);
  });

  // Listen for messages from the master process
  process.on("message", (message) => {
    if (message.cmd && message.cmd === "request") {
      // Handle the forwarded request
      app.emit("request", message.data);
    }
  });
}
