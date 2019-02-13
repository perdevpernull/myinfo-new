import { myinfoServer } from './myinfoServer/myinfoServer';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../webpack.myinfo.dev.config.js';

const app = myinfoServer();

// --- --- --- ---
config.mode = 'development';
const compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath
}));
app.use(webpackHotMiddleware(compiler));
// --- --- --- ---

const listeningPort = process.env.PORT || 8080;
app.listen(listeningPort, () => {
  console.log(`myinfoServer started on listeningPort (${listeningPort})`);
  console.log('Press Ctrl+C to quit.');
});
