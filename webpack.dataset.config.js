const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = (env, argv) => {
  const SERVER_PATH = (argv.mode === 'production')
    ? './src/dataset.js'
    : './src/dataset.js';

  return ({
    entry: {
      dataset: SERVER_PATH
    },
    plugins: [
      new CleanWebpackPlugin(['dist/dataset'])
    ],
    output: {
      path: path.join(__dirname, 'dist'),
      publicPath: '/',
      filename: '[name]/[name].js'
    },
    target: 'web',
    module: {
      rules: [
        {
          // Transpiles ES6-8 into ES5
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        }
      ]
    }
  });
};
