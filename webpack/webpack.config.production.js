const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

const outputPath = path.resolve(__dirname, '../dist');

const object = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        filename: './bundle.js',
		path: outputPath,
        publicPath: '/'
	},
    optimization: {
        minimize: true
    },
    plugins: [
        new Visualizer({
            filename: './webpack-prod-stats.html'
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: './src/assets', to: 'assets' },
                { from: './src/assets/favicon.ico', to: 'favicon.ico' },
                { from: './src/index.html', to: 'index.html' }
            ]
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: false,
            minify: {
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true,
                removeComments: true
            }
        }),
        new MiniCssExtractPlugin({ filename: '[name].css', chunkFilename: '[id].css' })
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
};

module.exports = object;