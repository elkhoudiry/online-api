import http from 'http';
import express from 'express';
import logging from './utils/logging';
import config from './utils/config';
import apiRoutes from './routes/api';
import path from 'path';
import cors from 'cors';

const NAMESPACE = 'server';

const router = express();
const server = http.createServer(router);

/** Allow cors */
router.use(cors());

/** Parse the request */
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

/** Logging requests */
router.use((req, res, next) => {
    logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        /** Log response */
        logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });

    next();
});

/** Rules */
router.use((req, res, next) => {
    // TODO remove in production with predefined routes & origins
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST PUT OPTIONS');
        return res.status(200).json({});
    }

    next();
});

/** Routes */
router.use('/api', apiRoutes);

/** Errors handle */
router.use((req, res, next) => {
    const err = new Error('oh not found!');

    return res.status(404).json({ message: `${err.message}` });
});

/** Start Server */
server.listen(config.server.port, () => logging.info(NAMESPACE, `Server started on ${config.server.hostname}:${config.server.port}`));
