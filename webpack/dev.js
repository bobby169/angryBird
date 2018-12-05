var path = require('path');
var webpack = require('webpack');
var merge = require('webpack-merge');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var autoprefixer = require('autoprefixer');
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
var baseWebpackConfig = require('./base');


var multipleHtml = [{
    filename: "index.html",
    path: "../src/index.html",
    chunks:["app"]
}]


multipleHtml.forEach(function(item) {
    baseWebpackConfig.plugins.push(new HtmlWebpackPlugin({
        filename: item.filename,
        template: 'inline-html-withimg-loader!'+path.resolve(__dirname, item.path),
        chunks: item.chunks
    }));
});


module.exports = merge(baseWebpackConfig, {
    output: {
        path: path.resolve(__dirname, '../dist/'),
        filename: 'js/[name].js',
        publicPath: '/'
    },

    devServer: {
        contentBase: path.resolve(__dirname,'../dist'),

        hot: true,
        // 开启服务器的模块热替换（HMR）

        host: 'localhost',

        port: 3000,

        inline: true,

        publicPath: '/',
        // 和上文output的"publicPath"值保持一致

        historyApiFallback: true,
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        // 开启全局的模块热替换（HMR）

        new webpack.NamedModulesPlugin(),
        // 当模块热替换（HMR）时在浏览器控制台输出对用户更友好的模块名字信息
        
        new FriendlyErrorsPlugin(),
    ]
});