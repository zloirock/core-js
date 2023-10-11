import { modules, ignored } from '@core-js/compat/src/data.mjs';
import '../compat/tests.js';

const modulesSet = new Set([
  ...modules,
  ...ignored,
]);

const tested = new Set(Object.keys(globalThis.tests));

const ignore = new Set([
  'esnext.iterator.sliding',
  'esnext.map.emplace',
  'esnext.observable.constructor',
  'esnext.observable.from',
  'esnext.observable.of',
  'esnext.reflect.define-metadata',
  'esnext.reflect.delete-metadata',
  'esnext.reflect.get-metadata',
  'esnext.reflect.get-metadata-keys',
  'esnext.reflect.get-own-metadata',
  'esnext.reflect.get-own-metadata-keys',
  'esnext.reflect.has-metadata',
  'esnext.reflect.has-own-metadata',
  'esnext.reflect.metadata',
  'esnext.weak-map.emplace',
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

if (error) throw new Error(error);
