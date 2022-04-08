import { modules } from 'core-js-compat/src/data.mjs';

async function generateNamespaceIndex(ns, filter) {
  return fs.writeFile(`./packages/core-js/${ ns }/index.js`, `${ modules
    .filter(it => filter.test(it))
    .map(it => `require('../modules/${ it }');\n`)
    .join('') }\nmodule.exports = require('../internals/path');\n`);
}

async function generateTestsIndex(name, pkg) {
  const dir = `tests/${ name }`;
  const files = await fs.readdir(dir);
  return fs.writeFile(`${ dir }/index.js`, `import '../helpers/qunit-helpers';\n\n${ files
    .filter(it => /^(?:es|esnext|web)\./.test(it))
    .map(it => `import './${ it.slice(0, -3) }';\n`)
    .join('') }${ pkg !== 'core-js' ? `\nimport core from '${ pkg }';\ncore.globalThis.core = core;\n` : '' }`);
}

await generateNamespaceIndex('es', /^es\./);
await generateNamespaceIndex('stable', /^(?:es|web)\./);
await generateNamespaceIndex('full', /^(?:es|esnext|web)\./);

await generateTestsIndex('tests', 'core-js');
await generateTestsIndex('pure', 'core-js-pure');

console.log(chalk.green('indexes generated'));
