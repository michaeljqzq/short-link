const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    open: true,
    hot: true,
    inline: true,
    contentBase: path.join(__dirname, 'dist'),
    port: 3333,
    historyApiFallback: true,
    proxy: {
      "/api": 'http://localhost:3001',
      "/": 'http://localhost:3001'
    }
  },
  module: {
    rules: [
      { test: /\.js$/, use: 'babel-loader' },
      {
        test: /\.scss$/, use: [
          {
            loader: "style-loader" // creates style nodes from JS strings
          },
          {
            loader: "css-loader" // translates CSS into CommonJS
          },
          {
            loader: "sass-loader" // compiles Sass to CSS
          // },
          // {
          //   loader: 'sass-resources-loader',
          //   options: {
          //     // Provide path to the file with resources
          //     resources: './src/global.scss',
          //   },
          }
        ]
      },
      {
        test: /\.css$/, use: [{
          loader: "style-loader" // creates style nodes from JS strings
        }, {
          loader: "css-loader" // translates CSS into CommonJS
        }]
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public/template.html")
    }),
    new CopyWebpackPlugin([{from: 'public'}])
  ]
};