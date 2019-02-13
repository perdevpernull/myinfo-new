import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import { apiHandler } from './apiHandler';
import memoryStoreFactory from 'memorystore';

const MemoryStore = memoryStoreFactory(session);

function myinfoServer () {
  const app = express();
  app.use(session({
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: true,
    saveUninitialized: true,
    secret: 'mysecret'
  }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // General routing: authentication
  app.all('/*', function (req, res, next) {
    if (req.session.userID) {
      console.log(`Already logged in: req.session.userID: ${req.session.userID} (${JSON.stringify(req.params)})`);
      next();
    } else {
      // ToDo: Redirecting to a login page.

      // Instead of loggin in and setting the userID
      // we set it to a default 0 value.
      req.session.userID = 'default@myinfo.local';
      console.log(`Logging in: req.session.userID: ${req.session.userID}`);
      // Right now we assume we already logged in. So we proceed.
      next();
    }
  });

  app.all('/api/:version/:function', apiHandler);

  app.all('*', (req, res, next) => {
    console.log('Other');
    next();
  });

  return app;
}

export { myinfoServer };
