import { parseAsync, traverse } from '@babel/core';
import { modules, ignored } from '../../packages/core-js-compat/src/data.mjs';
import '../compat/tests.js';

const modulesSet = new Set([
  ...modules,
  ...ignored,
]);

const tested = new Set(Object.keys(globalThis.tests));

// eslint-disable-next-line unicorn/no-useless-collection-argument -- allow for future cases
const ignore = new Set([
  // empty
]);

const missed = modules.filter(it => !(tested.has(it) || tested.has(it.replace(/^esnext\./, 'es.')) || ignore.has(it)));

let error = false;

for (const it of tested) {
  if (!modulesSet.has(it)) {
    echo(chalk.red(`added extra compat data test: ${ chalk.cyan(it) }`));
    error = true;
  }
}

if (missed.length) {
  echo(chalk.red('some of compat data tests missed:'));
  for (const it of missed) echo(chalk.cyan(it));
  error = true;
} else echo(chalk.green('adding of compat data tests not required'));

// a probe without a returned value is falsy in any engine, so it does not test its module at all
async function returnsValue(probe) {
  const ast = await parseAsync(`(${ probe })`, { babelrc: false, configFile: false });
  const [{ expression }] = ast.program.body;
  let returns = false;
  traverse(ast, {
    Function(path) {
      if (path.node !== expression) path.skip();
    },
    ReturnStatement({ node }) {
      if (node.argument) returns = true;
    },
  });
  return returns;
}

for (const [name, test] of Object.entries(globalThis.tests)) {
  const returns = await Promise.all([test].flat().map(returnsValue));
  if (!returns.every(Boolean)) {
    echo(chalk.red(`compat data test without a returned value: ${ chalk.cyan(name) }`));
    error = true;
  }
}

if (error) throw new Error(error);
