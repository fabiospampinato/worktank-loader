
/* IMPORT */

import {strictEqual} from 'assert';
import * as os from 'os';
import {sum, multiply, platform, noop, pool} from './example.worker';
import sumDefault from './example.worker';

/* TEST */

const test = async (): Promise<void> => {

  strictEqual ( 10, await sum ( 5, 5 ) );
  strictEqual ( 25, await multiply ( 5, 5 ) );
  strictEqual ( os.platform (), await platform () );
  strictEqual ( undefined, await noop () );
  strictEqual ( 10, await sumDefault ( 5, 5 ) );

  pool.terminate ();

};

/* RUN */

test ();
