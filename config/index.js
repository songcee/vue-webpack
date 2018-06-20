'use strict'

const path = require('path')

module.exports = {
  common: { //@llh common
    html: {
      index: path.resolve(__dirname, '../html/index.html')
    },
    entry: {
      app: './src/main.js'
    }
  },
  dev: {

    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: { //@llh
      '/api': 'xx.10jqka.com.cn/api'
    },

    // Various Dev Server settings
    host: 'localhost', // can be overwritten by process.env.HOST
    port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    hot: true, //@llh add
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    // poll: false, // @llh no-use
    useEslint: true,
    showEslintErrorsInOverlay: false,
    devtool: 'cheap-module-eval-source-map',
    cacheBusting: true, // @llh 缓存破坏
    cssSourceMap: false // @llh 
  },

  build: {
    // Template for index.html
    // index: path.resolve(__dirname, '../html/index.html'), //@llh remove - > common

    // Paths
    assetsRoot: path.resolve(__dirname, '../html'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',

    // source map
    productionSourceMap: true,
    devtool: '#source-map',
    // productionGzip: false, // @llh  去除，gz一套我们不用
    // productionGzipExtensions: ['js', 'css'], // @llh  去除，gz一套我们不用
    // bundleAnalyzerReport: process.env.npm_config_report //@llh move to CLI
  },

  release: {
    assetsRoot: path.resolve(__dirname, '../html'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: false,
    devtool: false
  }
}
