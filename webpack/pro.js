var path = require('path');
var webpack =require('webpack');
var merge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var autoprefixer = require('autoprefixer');
var InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');

var baseWebpackConfig = require('./base');

baseWebpackConfig.entry['vendor'] = ['./js/libs/utils.js','./js/libs/createjs-2015.11.26.min.js','./js/libs/box2dweb-2.1.a.3.min.js'];

baseWebpackConfig.module.rules[1].use = ExtractTextPlugin.extract({
    fallback: "style-loader",
    use: [{
        loader: 'css-loader',
        options: {
            minimize: true //css压缩
        }
    }, 'postcss-loader', 'less-loader'],
});


var multipleHtml = [{
    filename: "index.html",
    path: "../src/index.html",
    chunks: ['manifest', 'vendor', 'app']
}]


multipleHtml.forEach(function(item) {
    baseWebpackConfig.plugins.push(new HtmlWebpackPlugin({
        filename: item.filename,
        template: 'inline-html-withimg-loader!'+path.resolve(__dirname, item.path),
        chunks: item.chunks
    }));
});

webpackConfig = merge(baseWebpackConfig, {
    output: {
        path: path.resolve(__dirname, '../dist/'),
        filename: 'js/[name].[chunkHash].js',
        publicPath: '/',
        chunkFilename: "js/[name].[chunkHash].js",
    },
    devtool: false,

    plugins: [
        new CleanWebpackPlugin(['dist'], {
            root: path.resolve(__dirname, '../')
        }),

        new webpack.HashedModuleIdsPlugin(),

        new webpack.optimize.CommonsChunkPlugin({
            names: ['manifest','vendor'].reverse(),
            minChunks: Infinity, // 随着 入口chunk 越来越多，这个配置保证没其它的模块会打包进 公共chunk
        }),

        new webpack.NamedChunksPlugin(function(chunk) {
            if (chunk.name) {
                return chunk.name;
            }
            return chunk.mapModules(function(m) {return path.relative(m.context, m.request)}).join('_');
        }),

        new InlineManifestWebpackPlugin(),

        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_console: false,
            },
            sourceMap: true
        }),


        new ExtractTextPlugin('css/all.[contenthash].min.css'),


        // 编译时(compile time)插件
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
        }),
    ]
});


if (process.env.npm_config_report) {
    var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig;
