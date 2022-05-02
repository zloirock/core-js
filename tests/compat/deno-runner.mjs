/* global Deno -- it's Deno */
import './tests.js';
import './common-runner.js';

if (Deno.args.includes('--mode=JSON')) {
  console.log(JSON.stringify(globalThis.results, null, '  '));
} else {
  const data = JSON.parse(await Deno.readTextFile('packages/core-js-compat/data.json'));
  globalThis.showResults(data, 'deno', console.log);
}
