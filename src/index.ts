
/* IMPORT */

import type {Options} from 'worktank/dist/types';
import esbuild from 'esbuild';
import findUpJson from 'find-up-json';
import fs from 'node:fs';
import path from 'node:path';

/* HELPERS */

// = /[a-zA-Z$_][a-zA-Z0-9$_]*/;

const getBundle = ( filePath: string ): esbuild.BuildResult => {

  return esbuild.buildSync ({
    absWorkingDir: path.dirname ( filePath ),
    entryPoints: [filePath],
    tsconfig: findUpJson ( 'tsconfig.json' )?.path,
    format: 'esm',
    platform: 'node',
    target: 'es2018',
    bundle: true,
    minify: true,
    write: false
  });

};

const getExportsNames = ( dist: string ): string[] => {

  const exportsRe = .

};

const rewriteExports = ( dist: string ): string => {

  const exports = new Function ( 'require', 'exports', 'module', `${dist};return exports;` )( require, {}, {} );
  const methods = Object.keys ( exports ).filter ( method => typeof exports[method] === 'function' );

  return methods;

};

const getWorkerOptions = ( filePath: string, dist: string, source: string ): Options => {

  const methods = `var module={};var exports=module.exports={};${dist};return exports;`;
  const name = source.match ( /\/\/.*?WORKTANK_NAME.*?=.*?(\S+)/ )?.[1] || path.basename ( filePath );
  const size = Number ( source.match ( /\/\/.*?WORKTANK_SIZE.*?=.*?(\d+)/ )?.[1] || 1 );
  const options = {name, size, methods};

  return options;

};

const getWorkerModule = ( options: Options, methods: string[] ): string => {

  return [
    `import {createRequire} from 'node:module';`,
    `var require = createRequire ( 'import.meta.url );`,
    `var Pool=require('worktank');`, // Importing WorkTank
    `var pool=new Pool(${JSON.stringify ( options )});`, // Creating a pool
    ...methods.map ( method => `module.exports['${method}']=function(){return pool.exec('${method}',Array.prototype.slice.call(arguments))};` ), // Exporting wrapped methods
    `module.exports.pool=pool;` // Exporting pool
  ].join ( '' );

};

/* MAIN */

function loader ( this: { resourcePath: string } ): string {

  const filePath = this.resourcePath;

  const source = fs.readFileSync ( filePath, 'utf8' );

  const bundle = getBundle ( filePath );

  if ( !bundle.outputFiles || bundle.outputFiles.length < 1 ) throw new Error ( `WorkTank Loader: unsupported worker file "${filePath}", bundling failed` );

  if ( bundle.outputFiles.length > 1 ) throw new Error ( `WorkTank Loader: unsupported worker file "${filePath}", bundling generated multiple output files` );

  const dist = bundle.outputFiles[0].text;

  const exports = getExportsNames ( dist );


  const workerOptions = getWorkerOptions ( filePath, dist, source );
  const workerModule = getWorkerModule ( workerOptions, bundle );

  return workerModule;

};

/* EXPORT */

export default loader;
