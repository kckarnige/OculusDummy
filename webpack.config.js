// webpack.config.js
const path = require("path");

module.exports = {
  mode: "production",
  target: "electron-main",
  entry: "./index.js",
  output: {
    filename: "compiled.js",
    path: __dirname,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
};
