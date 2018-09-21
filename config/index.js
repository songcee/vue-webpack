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
    // stats: {  //@ljh add-webpack4
    //   children: false
    // }
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
    assetsPublicPath: './',

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
    devtool: false,

    // 自动上传资源服务器的相关配置---start
    thsi_open:true,  //是否开启（总开关）:true=开启自动上传;false=关闭自动上传
    thsi_user:'liluhui', //需要输入正确的用户和密码
    thsi_pwd:'hexin',
    //local_file，line_file是分别配置本地和线上的地址，需要一一对应
    thsi_local_file:["/html/s/js/dzl/tougu/test/test","/html/s/js/dzl/tougu/test/test23"],
    thsi_line_file:["./html/static/css","./html/static/js"],
    thsi_openWindow:true,//是否上传后在浏览器中打开资源文件:true=开启;false=关闭
    thsi_ifReplace:true //是否需要替换html中的资源路径:true=开启;false=关闭
  }
}
