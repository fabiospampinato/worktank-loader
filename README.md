> Note: this loader is deprecated, I've given up on porting it to ESM because WebPack is awful, this loader only works with v1.x.x of worktank.

# WorkTank Loader

WebPack plugin for [WorkTank](https://github.com/fabiospampinato/worktank) which enables you to execute whole files in a worker pool, transparently.

## Install

```sh
npm install --save-dev worktank-loader
```

## Usage

This WebPack plugin allows you to use [WorkTank](https://github.com/fabiospampinato/worktank) with functions that can't be extracted dynamically just by calling `#toString` on them but instead require bundling.

First of all functions to be executed in the worker pool must be defined in a file:

```ts
// example.worker.ts

// You can set a size different than 1 for the worker pool that will be created for this worker file by using a special comment that looks like the following one
// WORKTANK_SIZE = 3
// You can set a name different than the worker file's name for the worker pool that will be created for this worker file by using a special comment that looks like the following one
// WORKTANK_NAME = MyExampleWorker

// Dependencies will be handled automatically
import MyMath from 'some-math-module';

// Some functions to execute in the worker pool
const add = async ( a: number, b: number ) => a + b;
const multiply = async ( a: number, b: number ) => MyMath.multiply ( a * b );

// Exporting all functions
export {add, multiply};
```

Then WebPack must be configured to use `worktank-loader` for worker files:

```js
// webpack.config.js

module.exports = {
  externals: {
    // You might need this line if the WebPack target isn't set to "node"
    'worker_threads': 'commonjs2 worker_threads'
  },
  module: {
    rules: [
      {
        test: /\.worker\.[jt]s$/,
        use: 'worktank-loader'
      }
    ]
    // Your other rules here...
  }
};
```

Then import some exports from the worker file just like normal:

```ts
// app.ts

// Importing functions from the worker file like normal
import {add, multiply} from './example.worker';
// Importing the special injected "pool" export, which is a reference to the `WorkTank` instance that got created automatically for the worker file
import {pool} from './example.worker';

// Calling a function like normal
console.log ( await add ( 5, 10 ) ); // => 15

// Terminating the worker pool, if you want to
pool.terminate ();
```

Done!

## Tips and Details

- This loader has built-in support for parsing JavaScript and TypeScript files, so you don't need to chain this loader with other ones.
- This loader works completely transparenly, as far as the compiler is concerned you are just importing some async functions from a file, while in reality those functions will be executed into worker threads and the communication between those and the main thread is handled for you.
- If you are using TypeScript you should mark your worker functions as `async` even though they techinically aren't, because those functions will be moved to worker threads and even if they themselves are synchronous you'll always receive a promise to the return value from the worker threads. By doing that types will just work.
- This loader will inject a export called "pool" automatically, which will be a reference to the `WorkTank` instance created for the worker file.
  - If you are using TypeScript and you want to use that export you might want to add this dummy export to your worker file to make types just work: `const pool = {} as { terminate: Function }; export {pool};`.
- It's important to highlight that you can set the size of the worker pool that will be generated for each worker file by writing a comment that looks like this: `// WORKTANK_SIZE = 3`, where the number there refers to the number of worker threads to spawn.
  - This is a feature that makes this loader, and the underlying [WorkTank](https://github.com/fabiospampinato/worktank) library, especially interesting. Compared to other solutions you can spawn multiple worker threads easily, and the underlying library supports creating worker pools dynamically too, so all your worker needs are covered!
- This loader is still somewhat experimental, please open an issue if you can find any problems with it.

## License

MIT © Fabio Spampinato
