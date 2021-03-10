'use strict';
const { writeFile } = require('fs').promises;
const compat = require('core-js-compat/src/data');

const modules = Object.keys(compat);

function generate(ns, filter) {
  return writeFile(`./packages/core-js/${ ns }/index.js`, `${ modules
    .filter(it => filter.test(it))
    .map(it => `require('../modules/${ it }');\n`)
    .join('') }\nmodule.exports = require('../internals/path');\n`);
}

(async () => {
  await generate('es', /^es\./);
  await generate('stable', /^(es|web)\./);
  await generate('features', /^(es|esnext|web)\./);
  // eslint-disable-next-line no-console -- output
  console.log('\u001B[32mindexes generated\u001B[0m');
})();
