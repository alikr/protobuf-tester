/*
 * @author alikr
 */

const path = require('path')
const webpack = require('webpack')

function resolve(dir) {
  return path.join(__dirname, '../', dir)
}

module.exports = function(prod){
  const cssLoaders = require('./cssLoaders.js')(prod);
  return {
    entry: {
      'index': [resolve('../src/')],
      'background': [resolve('src/background')],
      'devtools-background': [resolve('src/devtools-background')],
      'devtools': [resolve('src/devtools')],
    },
    output: {
      path: resolve('scripts'),
      filename: '[name].js',
      chunkFilename: '[id].js',
      publicPath: '/'
    },
    plugins: [],
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            extractCSS: prod,
            loaders: {
              css: cssLoaders.vue,
              js: {
                loader: 'babel-loader'
              }
            }
          }
        },
        {
          test: /\.(js|es6)$/,
          loader: 'babel-loader',
          exclude: resolve('../node_module')
        },
        {
          test: /\.(png|jpg|gif)$/,
          loader: 'url-loader',
          options: {
            limit: 10,
            name: 'img/[name]-[hash:8].[ext]',
            publicPath: '../'
          }
        },
        {
          test: /\.((eot|ttf|otf|woff|woff2|svg)(\?.*)?)$/,
          loader: 'url-loader',
          options: {
            limit: 1,
            name: 'fonts/[name]-[hash:4].[ext]'
          }
        }]
    },
    resolve: {
      extensions: ['.js', '.vue'],
      alias: {
        '@chrome':resolve('src'),
        '@src':resolve('../src/'),
      }
    }
  }
}