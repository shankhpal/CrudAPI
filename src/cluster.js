const cluster = require('cluster');
const os = require('os');
const app = require('./server');

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < numCPUs - 1; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    app.listen(process.env.PORT + cluster.worker.id, () => {
        console.log(`Worker ${process.pid} started on port ${process.env.PORT + cluster.worker.id}`);
    });
}
