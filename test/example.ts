
/* IMPORT */

import {strictEqual} from 'node:assert';
import os from 'node:os';
import {sum, multiply, platform, mime2ext, pool} from './example.worker';
import sumDefault from './example.worker';

/* MAIN */

const test = async (): Promise<void> => {

  strictEqual ( 10, await sum ( 5, 5 ) );
  strictEqual ( 25, await multiply ( 5, 5 ) );
  strictEqual ( os.platform (), await platform () );
  strictEqual ( 'mp3', await mime2ext ( 'audio/mp3' ) );
  strictEqual ( 10, await sumDefault ( 5, 5 ) );

  pool.terminate ();

};

/* RUN */

test ();
