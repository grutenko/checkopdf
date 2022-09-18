const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

require('dotenv').config({ path: './.env' }); 

module.exports = [
  {
    mode: process.env.APP_ENV === 'production' ? 'production' : 'development',
    entry: "./src/index.ts",
    output: {
      path: path.join(__dirname, "dist"),
      filename: "main.js",
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          loader: "babel-loader",
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    target: "web",
    node: {
      __dirname: false,
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          { from: "*.pdf", context: "public" },
          { from: "*.ttf", context: "public" }
        ]
      }),
      new webpack.DefinePlugin({
        "process.env": JSON.stringify(process.env)
      }),
    ]
  }
];