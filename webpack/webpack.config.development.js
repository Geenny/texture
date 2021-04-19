const merge = require('webpack-merge');
const common = require('./webpack.config.js');

const host = 'localhost';
const port = 8080;

const object = {
	devtool: 'inline-source-map',
	devServer: {
		open: true,
		host: host,
		port: port,
		hot: true,
		https: false,
		overlay: {
			errors: true,
			warnings: false,
		}
	}
};

module.exports = merge(common, object);

