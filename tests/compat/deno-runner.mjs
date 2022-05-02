/* global Deno -- it's Deno */
import './tests.js';
import './common-runner.js';
const data = JSON.parse(await Deno.readTextFile('packages/core-js-compat/data.json'));

if (Deno.args.includes('--mode=JSON')) {
  console.log(JSON.stringify(globalThis.results, null, '  '));
} else globalThis.showResults(data, 'deno', console.log);
