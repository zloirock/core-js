'use strict';
const builder = require('core-js-builder');

(async function () {
  await builder({ filename: './packages/core-js-bundle/index.js' });
  // eslint-disable-next-line no-console -- output
  console.log('\u001B[32mbundled\u001B[0m');
})();
