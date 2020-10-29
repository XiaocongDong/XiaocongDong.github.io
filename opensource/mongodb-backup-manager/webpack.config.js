const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: [
        './src/app.js'
    ],
    devtool: 'source-map',
    output: {
        filename: 'js/app.js',
        path: path.resolve('.')
    },
    resolve: {
        // alias: {
        //     js: path.resolve('./src/js/'),
        //     sass: path.resolve('./src/sass')
        // }
        modules: [
            path.resolve('./src'),
            path.resolve('./node_modules')
        ]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        query: {
                            presets: ['env', 'react']
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract(
                    {
                        fallback: 'style-loader',
                        loader: [
                            'css-loader',
                            'postcss-loader',
                            'sass-loader'
                        ],
                        publicPath: '../'
                    }
                )
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'file-loader?name=img/img-[hash:6].[ext]'
            }
        ]
    },
    devServer: {
        contentBase: './src',
        hot: true
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: 'src/index.html', to: 'index.html'
            },
            {
                from: 'src/static/', to: './static'
            }
        ]),
        new ExtractTextPlugin('css/style.css'),
        // new webpack.HotModuleReplacementPlugin()
    ]
}