import fs from 'fs';
import path from 'path';
import https from 'https';

// Dependencies
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import limiter from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import Pipeline from './controllers/pipeline.mjs';

// Core
import config from './config.mjs';
import routes from './controllers/routes.mjs';

const Server = class Server {
  constructor() {
    this.app = express();
    this.config = config[process.argv[2]] || config.development;
  }

  async dbConnect() {
    try {
      const host = this.config.mongodb;

      this.connect = await mongoose.createConnection(host, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const close = () => {
        this.connect.close((error) => {
          if (error) {
            console.error('[ERROR] api dbConnect() close() -> mongodb error', error);
          } else {
            console.log('[CLOSE] api dbConnect() -> mongodb closed');
          }
        });
      };

      this.connect.on('error', (err) => {
        setTimeout(() => {
          console.log('[ERROR] api dbConnect() -> mongodb error');
          this.connect = this.dbConnect(host);
        }, 5000);

        console.error(`[ERROR] api dbConnect() -> ${err}`);
      });

      this.connect.on('disconnected', () => {
        setTimeout(() => {
          console.log('[DISCONNECTED] api dbConnect() -> mongodb disconnected');
          this.connect = this.dbConnect(host);
        }, 5000);
      });

      process.on('SIGINT', () => {
        close();
        console.log('[API END PROCESS] api dbConnect() -> close mongodb connection');
        process.exit(0);
      });
    } catch (err) {
      console.error(`[ERROR] api dbConnect() -> ${err}`);
    }
  }

  middleware() {
    limiter(this.app);
    limiter({
      path: '*',
      methods: 'all',
      lookup: ['connection.remoteAddress'],
      total: 100,
      expire: 15 * 60 * 1000,

      onRateLimit: (req, res) => {
        res.status(429).json({
          code: 429,
          message: 'Too many requests, please try again later'
        });
      }
    });
    this.app.use(compression());
    this.app.use(cors({
      origin: ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }));

    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
  }


  routes() {
    new routes.Users(this.app, this.connect);
    new routes.Photos(this.app, this.connect, this.jwtMiddleware);
    new routes.Albums(this.app, this.connect, this.jwtMiddleware);
    new routes.Auth(this.app);
    new Pipeline(this.app);

    this.app.use((req, res) => {
      res.status(404).json({
        code: 404,
        message: 'Not Found'
      });
    });
  }

  security() {
    this.app.use(helmet());
    this.app.disable('x-powered-by');
  }

  jwtMiddleware(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(403).json({
        code: 400,
        message: 'Bad request'
      });
    }

    return jwt.verify(token, 'efrei', (err, data) => {
      if (err) {
        return res.status(401).json({
          code: 401,
          message: 'Unauthorized'
        });
      }
      req.auth = data;
      next();
    });
  }

  async run() {
    try {
      const options = {
        key: fs.readFileSync(path.join(`ssl`, 'key.pem')),
        cert: fs.readFileSync(path.join(`ssl`, 'localhost.pem')),
      }
      await this.dbConnect();
      this.security();
      this.middleware();
      this.routes();
      //this.app.listen(this.config.port);
      const server = https.createServer(options, this.app, this.config.port);
      server.listen(this.config.port, () => {
        console.log(`HTTPS Server running on port ${this.config.port}`);
      });
    } catch (err) {
      console.error(`[ERROR] Server -> ${err}`);
    }
  }
};

export default Server;
