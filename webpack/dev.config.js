const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const commonConfig = require('./common.config');

// Override common config for standalone SPA development
const devConfig = merge(commonConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, '../frontend/dist'),
    publicPath: '/',
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../frontend/public/index.html'),
      inject: true,
    }),
  ],
  devServer: {
    port: 3000,
    static: {
      directory: path.resolve(__dirname, '../frontend/public'),
    },
    historyApiFallback: true, // Serve index.html for all routes (SPA routing)
    proxy: [
      {
        context: ['/api', '/dj-rest-auth', '/admin', '/accounts', '/static', '/media'],
        target: 'http://django:8000',
      },
    ],
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: true,
      },
    },
    // We need hot=false (Disable HMR) to set liveReload=true
    hot: false,
    liveReload: true,
  },
});

// Remove BundleTracker plugin for dev server
devConfig.plugins = devConfig.plugins.filter(plugin => 
  plugin.constructor.name !== 'BundleTracker'
);

module.exports = devConfig;
