'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

// @sc add hot-reload related code to entry chunks
// Object.keys(baseWebpackConfig.entry).forEach(function (name) {
//   baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
// })

let plugins = [
  new webpack.DefinePlugin({
    'process.env': require('../config/dev.env')
  }),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
  new webpack.NoEmitOnErrorsPlugin(),
  new CopyWebpackPlugin([
    {
      from: path.resolve(__dirname, '../static'),
      to: config.dev.assetsSubDirectory,
      ignore: ['.*']
    }
  ])
]

let devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',  //@ljh add-webpack4
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  devtool: config.dev.devtool,
  devServer: {
    clientLogLevel: 'warning',
    // historyApiFallback: {
    //   rewrites: [
    //     { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
    //   ],
    // }, // @llh no-use
    hot: config.dev.hot, //@llh 场景
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: false, //@llh no-use
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll || false,
    }
  },
  plugins: plugins
})

// @sc 配置html引用
var pages =  utils.getMultiEntry('./src/views/*.html');
for (var pathname in pages) {
  // 配置生成的html文件，定义路径等
  var conf = {
    filename: pathname + '.html',
    template: pages[pathname], // 模板路径
    chunks: [pathname, 'vendors', 'manifest'], // 每个html引用的js模块
    inject: true              // js插入位置
  } 
  // 需要生成几个html文件，就配置几个HtmlWebpackPlugin对象
  devWebpackConfig.plugins.push(new HtmlWebpackPlugin(conf))
}


module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))
      resolve(devWebpackConfig)
    }
  })
})
