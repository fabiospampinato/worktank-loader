
/* IMPORT */

const path = require ( 'path' );

/* CONFIG */

const config = {
  mode: 'production',
  target: 'node',
  entry: './example.ts',
  externals: {
    'worker_threads': 'commonjs2 worker_threads',
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.worker\.[jt]s/,
        use: path.resolve ( '../dist/index.js' )
      },
      {
        test: /\.ts$/,
        use: 'awesome-typescript-loader'
      }
    ]
  }
};

/* EXPORT */

module.exports = config;
