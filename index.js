const express = require("express");
const bodyParser = require('body-parser');
const {ts3Sync} = require('./ts3Sync');

process.on('SIGINT', process.exit);

function startServer() {
    const app = express();

    app.use(bodyParser.json());

    app.post('/syncteams', (req, res, next) => {
        ts3Sync(req.body);
    });

    app.listen(3000, err => {
        if (err) {
            console.error(err);
            process.exit(1);
            return;
        }
        console.info('listening on port: 3000');
    });
}

startServer();