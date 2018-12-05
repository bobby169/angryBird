var path = require('path');
const webpack = require("webpack");

module.exports = {
  context: path.resolve(__dirname, '../src'),
  entry: {
    app: './js/app.js',
    //createjs: './js/libs/createjs-2015.11.26.min.js'
    //createjs: './js/libs/createjs.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },

      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "postcss-loader", "less-loader"],
      },

      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader?limit=1&name=images/[hash].[name].[ext]'
      }
    ]
  },
  devtool: '#cheap-module-eval-source-map',
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      createjs$: path.resolve(__dirname, '../src/js/libs/createjs-2015.11.26.min.js'),
      Box2D$: path.resolve(__dirname, '../src/js/libs/box2dweb-2.1.a.3.min.js'),
      "path_libs": path.resolve(__dirname,'../src/js/libs'),
      "images" : path.resolve(__dirname,'../src/images')
    }
  },
  plugins: [
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'createjs',
    //   filename: 'createjs.js'
    // })
    // new webpack.ProvidePlugin({
    //   createjs: 'createjs',
    // })
  ]
}
