import { modules, ignored } from 'core-js-compat/src/data.mjs';
import '../tests/compat/tests.js';

const modulesSet = new Set([
  ...modules,
  ...ignored,
]);
const tested = new Set(Object.keys(globalThis.tests));
const ignore = new Set([
  'es.aggregate-error',
  'es.data-view',
  'es.map',
  'es.set',
  'es.weak-map',
  'es.weak-set',
  'esnext.aggregate-error',
  'esnext.array.filter-out',
  'esnext.array.last-index',
  'esnext.array.last-item',
  'esnext.map.update-or-insert',
  'esnext.map.upsert',
  'esnext.math.iaddh',
  'esnext.math.imulh',
  'esnext.math.isubh',
  'esnext.math.seeded-prng',
  'esnext.math.umulh',
  'esnext.object.iterate-entries',
  'esnext.object.iterate-keys',
  'esnext.object.iterate-values',
  'esnext.promise.try',
  'esnext.reflect.define-metadata',
  'esnext.reflect.delete-metadata',
  'esnext.reflect.get-metadata',
  'esnext.reflect.get-metadata-keys',
  'esnext.reflect.get-own-metadata',
  'esnext.reflect.get-own-metadata-keys',
  'esnext.reflect.has-metadata',
  'esnext.reflect.has-own-metadata',
  'esnext.reflect.metadata',
  'esnext.string.at',
  'esnext.symbol.metadata',
  'esnext.symbol.pattern-match',
  'esnext.symbol.replace-all',
  'esnext.typed-array.from-async',
  'esnext.typed-array.filter-out',
  'esnext.typed-array.group-by',
  'esnext.weak-map.upsert',
  'web.url-search-params',
  'web.url',
]);

const missed = modules.filter(it => !(tested.has(it) || tested.has(it.replace(/^esnext\./, 'es.')) || ignore.has(it)));

for (const it of tested) {
  if (!modulesSet.has(it)) console.log(chalk.red(`added extra compat data test: ${ chalk.cyan(it) }`));
}

if (missed.length) {
  console.log(chalk.red('some of compat data tests missed:'));
  for (const it of missed) console.log(chalk.cyan(it));
} else console.log(chalk.green('adding of compat data tests not required'));
