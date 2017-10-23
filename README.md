A small express proxy to be able to run queries to you dyn 365 online instance from localhost

This package requires a working config of (dyn365-deploy-cli)[https://www.npmjs.com/package/dyn365-deploy-cli]

webpack-dev-server config:

`
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var path = require('path');

module.exports = {
    entry: {
        costcomparison: "./src/CostComparison.tsx"
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "stq_//build"),
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".scss", ".css"],
        modules: [
            'node_modules',
            path.resolve(__dirname, './node_modules')
        ]
    },
    devtool: "eval",
    devServer: {
        contentBase: path.join(__dirname, ""),        
        publicPath: "/stq_/build/",
        index: './stq_/html/costcomparison.html',
        proxy: {
            '/api': {
              target: 'http://localhost:8085',
              secure: false
            }
        }
    },
    module: {
        rules: [{
            test: /\.ts(x)?$/,
            use: [
                {
                    loader: 'babel-loader',
                },
                {
                    loader: 'ts-loader'
                }
            ]
        },
        {
            test: /\.css$/,
            use: 'css-loader'
        },
        {
            test: /\.js$/,
            use: "source-map-loader",
            enforce: 'pre',
        },
        {
            test: /\.js$/,
            loader: 'babel-loader'
        }
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('development')
            }
        }),
        new UglifyJSPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /sv/),
        new webpack.IgnorePlugin(/^\.\/lang$/, /moment$/),
    ]
}

`


add this to packaje.json:
`
scripts:{
    "proxy": "node .\\node_modules\\dyn365-dev-proxy\\server.js"
}
`
and just run npm start proxy

