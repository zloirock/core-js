import { modules } from '@core-js/compat/src/data.mjs';

async function generateNamespaceIndex(ns, filter) {
  return fs.writeFile(`./packages/core-js/${ ns }/index.js`, `'use strict';\n${ modules
    .filter(it => filter.test(it))
    .map(it => `require('../modules/${ it }');\n`)
    .join('') }\nmodule.exports = require('../internals/path');\n`);
}

async function generateTestsIndex(name, pkg) {
  const dir = `tests/${ name }`;
  const files = await fs.readdir(dir);
  return fs.writeFile(`${ dir }/index.js`, `import '../helpers/qunit-helpers';\n\n${ files
    .filter(it => /^(?:es|esnext|helpers|web)\./.test(it))
    .map(it => `import './${ it.slice(0, -3) }';\n`)
    .join('') }${ pkg !== 'core-js' ? `\nimport core from '${ pkg }';\ncore.globalThis.core = core;\n` : '' }`);
}

await generateNamespaceIndex('es', /^es\./);
await generateNamespaceIndex('stable', /^(?:es|web)\./);
await generateNamespaceIndex('full', /^(?:es|esnext|web)\./);

await generateTestsIndex('unit-global', 'core-js');
await generateTestsIndex('unit-pure', 'core-js-pure');

echo(chalk.green('indexes generated'));
