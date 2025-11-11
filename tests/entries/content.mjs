import { deepEqual, ok } from 'node:assert/strict';
import konan from 'konan';

const allModules = await fs.readJson('packages/core-js-compat/modules.json');
const entries = await fs.readJson('packages/core-js-compat/entries.json');

function filter(regexp) {
  return allModules.filter(it => regexp.test(it));
}

function equal(name, required) {
  const contains = new Set(entries[name]);
  const shouldContain = new Set(Array.isArray(required) ? required : filter(required));
  deepEqual(contains, shouldContain);
}

function superset(name, required) {
  const contains = new Set(entries[name]);
  const shouldContain = Array.isArray(required) ? required : filter(required);
  for (const module of shouldContain) {
    ok(contains.has(module), module);
  }
}

function subset(name, required) {
  const contains = entries[name];
  const shouldContain = new Set(Array.isArray(required) ? required : filter(required));
  for (const module of contains) {
    ok(shouldContain.has(module), module);
  }
}

superset('actual', /^(?:es|web)\./);
equal('es', /^es\./);
superset('es/array', /^es\.array\./);
superset('es/array-buffer', /^es\.array-buffer\./);
superset('es/data-view', /^es\.data-view\./);
superset('es/date', /^es\.date\./);
superset('es/error', /^es\.error\./);
superset('es/function', /^es\.function\./);
superset('es/json', /^es\.json\./);
superset('es/map', /^es\.map/);
superset('es/math', /^es\.math\./);
superset('es/number', /^es\.number\./);
superset('es/object', /^es\.object\./);
superset('es/promise', /^es\.promise/);
superset('es/reflect', /^es\.reflect\./);
superset('es/regexp', /^es\.regexp\./);
superset('es/set', /^es\.set/);
superset('es/string', /^es\.string\./);
superset('es/symbol', /^es\.symbol/);
superset('es/typed-array', /^es\.typed-array\./);
superset('es/weak-map', /^es\.weak-map/);
superset('es/weak-set', /^es\.weak-set/);
equal('stable', /^(?:es|web)\./);
superset('stable/array', /^es\.array\./);
superset('stable/array-buffer', /^es\.array-buffer\./);
superset('stable/data-view', /^es\.data-view\./);
superset('stable/date', /^es\.date\./);
superset('stable/dom-collections', /^web\.dom-collections\./);
superset('stable/error', /^es\.error\./);
superset('stable/function', /^es\.function\./);
superset('stable/json', /^es\.json\./);
superset('stable/map', /^es\.map/);
superset('stable/math', /^es\.math\./);
superset('stable/number', /^es\.number\./);
superset('stable/object', /^es\.object\./);
superset('stable/promise', /^es\.promise/);
superset('stable/reflect', /^es\.reflect\./);
superset('stable/regexp', /^es\.regexp\./);
superset('stable/set', /^es\.set/);
superset('stable/string', /^es\.string\./);
superset('stable/symbol', /^es\.symbol/);
superset('stable/typed-array', /^es\.typed-array\./);
superset('stable/url', /^web\.url(?:\.|$)/);
superset('stable/url-search-params', /^web\.url-search-params/);
superset('stable/weak-map', /^es\.weak-map/);
superset('stable/weak-set', /^es\.weak-set/);
superset('actual', /^(?:es|web)\./);
superset('actual/array', /^es\.array\./);
superset('actual/array-buffer', /^es\.array-buffer\./);
superset('actual/data-view', /^es\.data-view\./);
superset('actual/date', /^es\.date\./);
superset('actual/dom-collections', /^web\.dom-collections\./);
superset('actual/function', /^es\.function\./);
superset('actual/json', /^es\.json\./);
superset('actual/map', /^es\.map/);
superset('actual/math', /^es\.math\./);
superset('actual/number', /^es\.number\./);
superset('actual/object', /^es\.object\./);
superset('actual/promise', /^es\.promise/);
superset('actual/reflect', /^es\.reflect\./);
superset('actual/regexp', /^es\.regexp\./);
superset('actual/set', /^es\.set/);
superset('actual/string', /^es\.string\./);
superset('actual/symbol', /^es\.symbol/);
superset('actual/typed-array', /^es\.typed-array\./);
superset('actual/url', /^web\.url(?:\.|$)/);
superset('actual/url-search-params', /^web\.url-search-params/);
superset('actual/weak-map', /^es\.weak-map/);
superset('actual/weak-set', /^es\.weak-set/);
equal('full', allModules);
superset('full/array', /^(?:es|esnext)\.array\./);
superset('full/array-buffer', /^(?:es|esnext)\.array-buffer\./);
superset('full/async-iterator', /^(?:es|esnext)\.async-iterator\./);
superset('full/data-view', /^(?:es|esnext)\.data-view\./);
superset('full/date', /^(?:es|esnext)\.date\./);
superset('full/dom-collections', /^web\.dom-collections\./);
superset('full/error', /^es\.error\./);
superset('full/function', /^(?:es|esnext)\.function\./);
superset('full/iterator', /^(?:es|esnext)\.iterator\./);
superset('full/json', /^(?:es|esnext)\.json\./);
superset('full/map', /^(?:es|esnext)\.map/);
superset('full/math', /^(?:es|esnext)\.math\./);
superset('full/number', /^(?:es|esnext)\.number\./);
superset('full/object', /^(?:es|esnext)\.object\./);
superset('full/observable', /^(?:es|esnext)\.observable/);
superset('full/promise', /^(?:es|esnext)\.promise/);
superset('full/reflect', /^(?:es|esnext)\.reflect\./);
superset('full/regexp', /^(?:es|esnext)\.regexp\./);
superset('full/set', /^(?:es|esnext)\.set/);
superset('full/string', /^(?:es|esnext)\.string\./);
superset('full/symbol', /^(?:es|esnext)\.symbol/);
superset('full/typed-array', /^(?:es|esnext)\.typed-array\./);
superset('full/url', /^web\.url(?:\.|$)/);
superset('full/url-search-params', /^web\.url-search-params/);
superset('full/weak-map', /^(?:es|esnext)\.weak-map/);
superset('full/weak-set', /^(?:es|esnext)\.weak-set/);
subset('stage/0', /^(?:es\.|esnext\.)/);
subset('stage/1', /^(?:es\.|esnext\.)/);
subset('stage/2', /^(?:es\.|esnext\.)/);
subset('stage/3', /^(?:es\.|esnext\.)/);

async function unexpectedInnerNamespace(namespace, unexpected) {
  const paths = await glob(`packages/core-js/${ namespace }/**/*.js`);
  await Promise.all(paths.map(async path => {
    for (const dependency of konan(String(await fs.readFile(path))).strings) {
      if (unexpected.test(dependency)) {
        echo(chalk.red(`${ chalk.cyan(path) }: found unexpected dependency: ${ chalk.cyan(dependency) }`));
      }
    }
  }));
}

await Promise.all([
  unexpectedInnerNamespace('es', /\/(?:actual|full|stable)\//),
  unexpectedInnerNamespace('stable', /\/(?:actual|full)\//),
  unexpectedInnerNamespace('actual', /\/(?:es|full)\//),
  unexpectedInnerNamespace('full', /\/(?:es|stable)\//),
]);

echo(chalk.green('entry points content tested'));
