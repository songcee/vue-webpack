'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

// const ExtractTextPlugin = require('extract-text-webpack-plugin') //@ljh del-webpack4
const MiniCssExtractPlugin = require("mini-css-extract-plugin")  //@ljh add-webpack4

// const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin') //@llh remove
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin') //@llh remove
//@ljh add-分线程提速
const HappyPack = require('happypack');
const os = require('os'); //获取电脑的处理器有几个核心，作为配置传入
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

const entries =  utils.getMultiEntry('./src/views/*.js') // @sc 获得入口js文件
const env = require('../config/prod.env')

let plugin = [
  new webpack.DefinePlugin({
    'process.env': env
  }),
  new HappyPack({
    //开启多线程打包
    id: 'babel-loader',
    loaders: ['babel-loader?cacheDirectory=true'],
    threadPool: happyThreadPool
  }),
  // new UglifyJsPlugin({
  //   uglifyOptions: {
  //     compress: {
  //       warnings: false
  //     }
  //   },
  //   sourceMap: config.build.productionSourceMap,
  //   parallel: true
  // }), //@llh remove
  // extract css into its own file

  //@ljh add-webpack4
  // new ExtractTextPlugin({ 
  //   filename: utils.assetsPath('css/[name].css'), //@llh remove hash
  //   // Setting the following option to `false` will not extract CSS from codesplit chunks.
  //   // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
  //   // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`, 
  //   // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
  //   allChunks: true,
  // }),

  new MiniCssExtractPlugin({
    filename: utils.assetsPath('css/[name].css'),
    allChunks: true
  }),

  //end

  // Compress extracted CSS. We are using this plugin so that possible
  // duplicated CSS from different components can be deduped.
  // new OptimizeCSSPlugin({
  //   cssProcessorOptions: config.build.productionSourceMap
  //     ? { safe: true, map: { inline: false } }
  //     : { safe: true }
  // }), // @llh remove
  // keep module.id stable when vendor modules does not change
  new webpack.HashedModuleIdsPlugin(),
  // enable scope hoisting
  new webpack.optimize.ModuleConcatenationPlugin(),
  // split vendor js into its own file

  //@ljh del-webpack4
  // new webpack.optimize.CommonsChunkPlugin({
  //   name: 'vendor',
  //   minChunks (module) {
  //     // any required modules inside node_modules are extracted to vendor
  //     return (
  //       module.resource &&
  //       /\.js$/.test(module.resource) &&
  //       module.resource.indexOf(
  //         path.join(__dirname, '../node_modules')
  //       ) === 0
  //     )
  //   }
  // }),

  // new webpack.optimize.CommonsChunkPlugin({
  //   name: 'manifest',
  //   minChunks: Infinity
  // }),

  // new webpack.optimize.CommonsChunkPlugin({
  //   name: 'app',
  //   async: 'vendor-async',
  //   children: true,
  //   minChunks: 3
  // }),
  //end

  // copy custom static assets
  new CopyWebpackPlugin([
    {
      from: path.resolve(__dirname, '../static'),
      to: config.build.assetsSubDirectory,
      ignore: ['.*']
    }
  ])
]
// .concat(utils.assetsHtmls())

const webpackConfig = merge(baseWebpackConfig, {
  mode:'production',  //@ljh add-webpack4
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].js'),
    chunkFilename: utils.assetsPath('js/[name].js')
  },
  plugins: plugin,
  //@ljh add-webpack4
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all'
        },
        manifest: {
          name: 'manifest',
          minChunks: Infinity
        }
      }
    }
  }
  //end
})

// @llh remove
// if (config.build.productionGzip) {
//   const CompressionWebpackPlugin = require('compression-webpack-plugin')

//   webpackConfig.plugins.push(
//     new CompressionWebpackPlugin({
//       asset: '[path].gz[query]',
//       algorithm: 'gzip',
//       test: new RegExp(
//         '\\.(' +
//         config.build.productionGzipExtensions.join('|') +
//         ')$'
//       ),
//       threshold: 10240,
//       minRatio: 0.8
//     })
//   )
// }

// if (config.build.bundleAnalyzerReport) {
//   const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
//   webpackConfig.plugins.push(new BundleAnalyzerPlugin())
// }

// @sc 配置html引用
var pages =  utils.getMultiEntry('./src/views/*.html')

for (var pathname in pages) {

  var conf = {
    filename: pathname + '.html',
    template: pages[pathname], // 模板路径
    chunks: ['vendor',pathname], // 每个html引用的js模块
    inject: true,              // js插入位置
    hash: false
  }

  webpackConfig.plugins.push(new HtmlWebpackPlugin(conf))
}

module.exports = webpackConfig
