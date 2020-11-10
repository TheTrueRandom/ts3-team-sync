const express = require("express");
const bodyParser = require('body-parser');
const {ts3Sync, getTsState} = require('./ts3Sync');
const {errorHandler} = require('express-api-error-handler');

process.on('SIGINT', process.exit);

function startServer() {
    const app = express();

    app.use(bodyParser.json());

    app.post('/syncteams', async (req, res, next) => {
        console.log(`syncteams request: ${JSON.stringify(req.body)}`);
        try {
            const result = await ts3Sync(req.body);
            return res.json(result)
        } catch (e) {
            next(e);
        }
    });

    app.get('/state', async (req, res, next) => {
        try {
            const result = await getTsState(req.body);
            const polyfill = [];
            for (let i = 0; i < 10; i++) {
                polyfill[i] = result[i] || null;
            }
            return res.json({
                count: result.length,
                state: result,
                polyfill: polyfill
            });
        } catch (e) {
            next(e);
        }
    });

    app.use(errorHandler({
        log: ({err}) => {
            console.error(err);
        },
    }));

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