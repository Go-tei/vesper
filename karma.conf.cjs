const fs = require('node:fs');
const path = require('node:path');

if (!process.env.CHROME_BIN && fs.existsSync('/usr/bin/chromium')) {
  process.env.CHROME_BIN = '/usr/bin/chromium';
}

module.exports = function configureKarma(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'webpack'],
    files: [
      { pattern: 'public/assets/**/*', included: false, served: true, watched: false },
      { pattern: 'tests/index.js', watched: false },
    ],
    proxies: { '/assets/': '/base/public/assets/' },
    preprocessors: { 'tests/index.js': ['webpack'] },
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: { extensions: ['.js', '.jsx'] },
      module: {
        rules: [
          {
            test: /\.[jt]sx?$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: { chrome: '110' } }],
                  ['@babel/preset-react', { runtime: 'automatic' }],
                ],
                plugins: [
                  ['istanbul', { include: ['src/**/*.js', 'src/**/*.jsx'], exclude: ['tests/**'] }],
                ],
              },
            },
          },
        ],
      },
      stats: 'errors-warnings',
    },
    webpackMiddleware: { stats: 'errors-only' },
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      dir: path.join(__dirname, 'coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'lcovonly', file: 'lcov.info' },
        { type: 'json-summary', file: 'coverage-summary.json' },
        { type: 'text-summary' },
      ],
    },
    customLaunchers: {
      ChromiumHeadless: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-dev-shm-usage'],
      },
    },
    browsers: ['ChromiumHeadless'],
    client: { jasmine: { random: false }, clearContext: false },
    browserNoActivityTimeout: 30000,
    singleRun: false,
    restartOnFileChange: true,
  });
};
