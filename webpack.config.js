const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const path = require('path');
require('dotenv').config();

module.exports = {
  plugins: [
    new Dotenv({
      path: path.resolve(__dirname, '.env'),
      systemvars: true,
      safe: false,
      allowEmptyValues: true,
    }),
  ],
};
