import express from 'express';
import path from 'path';
import { myinfoServer } from './myinfoServer/myinfoServer';

const app = myinfoServer();

const staticDir = path.join(__dirname, '..');
console.log(`myinfoServer static dir (${staticDir})`);
// ToDo: Not safe to serve everything. Should only serve a safe static dir.
app.use(express.static(staticDir));

const listeningPort = process.env.PORT || 8080;
console.log(`myinfoServer listeningPort (${listeningPort})`);
app.listen(listeningPort, () => {
  console.log('myinfoServer started');
  console.log('Press Ctrl+C to quit.');
});
