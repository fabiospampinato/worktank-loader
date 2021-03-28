
// WORKTANK_SIZE = 3 // Spawining up-to 3 workers, if needed

/* IMPORT */

import * as os from 'os';
import noop from 'noop3';

/* WORKER METHODS */

const sum = async ( a: number, b: number ) => a + b;
const multiply = async ( a: number, b: number ): Promise<number> => a * b;
const platform = async (): Promise<string> => os.platform ();
const pool = {} as { terminate: Function }; // Dummy export to ~tell TypeScript about the injected "pool" export

/* EXPORT */

export {sum, multiply, platform, noop, pool};
