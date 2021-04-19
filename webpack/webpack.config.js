const webpack = require( 'webpack' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );

const host = 'localhost';
const port = ( process.argv[2] ) || 8080;

module.exports = {
	mode: 'development',
	entry: {
		mainjs: [
			'webpack-dev-server/client?http://' + host + ':' + port,
			'webpack/hot/dev-server',
			'./src/index.js'
		],
	},
	output: {
		path: __dirname,
		filename: 'bundle.js',
		publicPath: '/'
	},
	resolve: {
		alias: {
			// tweenjs: 'tweenjs/lib/tweenjs.js'
		}
	},
	externals: {
		config: 'config'
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new CopyWebpackPlugin([
            { from: './src/assets', to: 'assets' },
            { from: './src/assets/favicon.ico', to: 'favicon.ico' },
            { from: './src/index.html', to: 'index.html' }
		])
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					presets: [ 'es2015', 'stage-0' ]
				}
			}
		]
	}
}
