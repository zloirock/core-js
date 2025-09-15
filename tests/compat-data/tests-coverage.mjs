import { modules, ignored } from 'core-js-compat/src/data.mjs';
import '../compat/tests.js';

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
  'esnext.array.group',
  'esnext.array.group-by',
  'esnext.array.group-by-to-map',
  'esnext.array.group-to-map',
  'esnext.array.last-index',
  'esnext.array.last-item',
  'esnext.async-iterator.as-indexed-pairs',
  'esnext.async-iterator.indexed',
  'esnext.bigint.range',
  'esnext.function.un-this',
  'esnext.iterator.as-indexed-pairs',
  'esnext.iterator.indexed',
  'esnext.iterator.sliding',
  'esnext.map.emplace',
  'esnext.map.update-or-insert',
  'esnext.map.upsert',
  'esnext.math.clamp',
  'esnext.math.iaddh',
  'esnext.math.imulh',
  'esnext.math.isubh',
  'esnext.math.seeded-prng',
  'esnext.math.umulh',
  'esnext.number.range',
  'esnext.object.iterate-entries',
  'esnext.object.iterate-keys',
  'esnext.object.iterate-values',
  'esnext.observable',
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
  'esnext.set.difference',
  'esnext.set.intersection',
  'esnext.set.is-disjoint-from',
  'esnext.set.is-subset-of',
  'esnext.set.is-superset-of',
  'esnext.set.symmetric-difference',
  'esnext.set.union',
  'esnext.string.at',
  'esnext.symbol.is-registered',
  'esnext.symbol.is-well-known',
  'esnext.symbol.matcher',
  'esnext.symbol.metadata-key',
  'esnext.symbol.pattern-match',
  'esnext.symbol.replace-all',
  'esnext.typed-array.from-async',
  'esnext.typed-array.filter-out',
  'esnext.typed-array.group-by',
  'esnext.typed-array.to-spliced',
  'esnext.weak-map.emplace',
  'esnext.weak-map.upsert',
  'web.url-search-params',
  'web.url',
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
