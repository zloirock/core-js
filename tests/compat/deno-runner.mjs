/* global Deno -- it's Deno */
import './tests.js';
import './compat-data.js';
import './common-runner.js';

if (Deno.args.includes('--mode=JSON')) {
  console.log(JSON.stringify(globalThis.results, null, '  '));
} else globalThis.showResults('deno', console.log);
