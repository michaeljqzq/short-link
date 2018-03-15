const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = [{
  entry: './src/index.js',
  output: {
    filename: 'mjstatic.bundle.js',
    path: path.resolve(__dirname, 'dist/web')
  },
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        enforce: 'pre',
        use: [{
          loader: 'eslint-loader',
          options: { fix: true }
        }],
        include: path.resolve(__dirname, './src/**/*.js'),
        exclude: /node_modules/
      },
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
},
// API
{
  target: 'node',
  node: {
    __dirname: false, // Add this to prevent set __dirname as / in linux
    __filename: false,
  },
  externals: [nodeExternals()],
  entry: ['babel-polyfill', './api/index.js'],
  output: {
    filename: 'api.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      { test: /\.js$/, use: 'babel-loader' } // exclude: /(_project_config|_project_credential)\.js$/
    ]
  },
  plugins: [
    new CopyWebpackPlugin(['config.json'])
  ]
},
];