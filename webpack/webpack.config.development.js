const merge = require('webpack-merge');
const common = require('./webpack.config.js');

const host = 'localhost';
const port = 9000;

const object = {
	devtool: 'inline-source-map',
	devServer: {
		open: true,
		host: host,
		port: port,
		https: false,
		hot: true
	}
};

module.exports = merge(common, object);

