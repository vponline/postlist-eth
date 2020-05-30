const path = require('path');

//mode 'development' for local webpack dev server
module.exports = {
  mode: 'production',
  entry: './client/index.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 8080
  }
};