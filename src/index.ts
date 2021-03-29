
/* IMPORT */

import {Options} from 'worktank/dist/types';
import * as esbuild from 'esbuild';
import * as findUp from 'find-up';
import * as fs from 'fs';
import * as path from 'path';

/* HELPERS */

const getBundle = ( filePath: string ): esbuild.BuildResult => {

  return esbuild.buildSync ({
    absWorkingDir: path.dirname ( filePath ),
    entryPoints: [filePath],
    tsconfig: findUp.sync ( 'tsconfig.json' ),
    format: 'cjs',
    platform: 'node',
    target: 'es2017',
    bundle: true,
    minify: true,
    write: false
  });

};

const getMethods = ( dist: string ): string[] => {

  const exports = new Function ( 'require', 'exports', 'module', `${dist};return exports;` )( require, {}, {} ),
        methods = Object.keys ( exports ).filter ( method => typeof exports[method] === 'function' );

  return methods;

};

const getWorkerOptions = ( dist: string, source: string ): Options => {

  const methods = `var module={};var exports=module.exports={};${dist};return exports;`,
        size = Number ( source.match ( /\/\/.*?WORKTANK_SIZE.*?=.*?(\d+)/ )?.[1] || 1 ),
        options = {size, methods};

  return options;

};

const getWorkerModule = ( options: Options, methods: string[] ): string => {

  return [
    `var Pool=require('worktank');`, // Importing WorkTank
    `var pool=new Pool(${JSON.stringify ( options )});`, // Creating a pool
    ...methods.map ( method => `module.exports['${method}']=function(){return pool.exec('${method}',Array.prototype.slice.call(arguments))};` ), // Exporting wrapped methods
    `module.exports.pool=pool;` // Exporting pool
  ].join ( '' );

};

/* WORKTANK LOADER */

function loader (): string {

  const filePath = this.resourcePath;

  const source = fs.readFileSync ( filePath, 'utf8' );

  const bundle = getBundle ( filePath );

  if ( !bundle.outputFiles || bundle.outputFiles.length < 1 ) throw new Error ( `WorkTank Loader: unsupported worker file "${filePath}", bundling failed` );

  if ( bundle.outputFiles.length > 1 ) throw new Error ( `WorkTank Loader: unsupported worker file "${filePath}", bundling generated multiple output files` );

  const dist = bundle.outputFiles[0].text;

  const methods = getMethods ( dist );

  if ( !methods.length ) throw new Error ( `WorkTank Loader: no exported functions found in worker file "${filePath}"` );

  if ( methods.includes ( 'pool' ) ) throw new Error ( `WorkTank Loader: worker file "${filePath}" exports function named "pool", you have to rename that, an export named "pool" will be injected by the loader automatically` );

  const workerOptions = getWorkerOptions ( dist, source ),
        workerModule = getWorkerModule ( workerOptions, methods );

  return workerModule;

};

/* EXPORT */

export default loader;
