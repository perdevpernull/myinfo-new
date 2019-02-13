const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    myinfo: './src/myinfo.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name]/[name].js',
    library: 'myinfo'
  },
  mode: 'development',
  target: 'web',
  devtool: '#source-map',
  module: {
    rules: [
      {
        test: /settings\..*\.jsondb$/,
        use: ['file-loader?name=myinfo/[name].[ext]']
      },
      {
        test: /userdata\..*\.jsondb$/,
        use: ['file-loader?name=myinfo/default@myinfo.local/[name].[ext]']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        // Loads the javacript into html template provided.
        // Entry point is set below in HtmlWebPackPlugin in Plugins
        test: /\.(html|ico)$/,
        use: ['file-loader?name=myinfo/[name].[ext]', 'extract-loader', 'html-loader']
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist/myinfo'])
  ]
};
