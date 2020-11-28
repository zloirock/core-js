'use strict';
const { deepStrictEqual, ok } = require('assert');
const allModules = require('core-js-compat/modules');
const entries = require('core-js-compat/entries');

function filter(regexp) {
  return allModules.filter(it => regexp.test(it));
}

function equal(name, required) {
  const contains = new Set(entries[name]);
  const shouldContain = new Set(Array.isArray(required) ? required : filter(required));
  deepStrictEqual(contains, shouldContain);
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

equal('core-js', allModules);
equal('core-js/es', /^es\./);
superset('core-js/es/array', /^es\.array\./);
superset('core-js/es/array-buffer', /^es\.array-buffer\./);
superset('core-js/es/data-view', /^es\.data-view\./);
superset('core-js/es/date', /^es\.date\./);
superset('core-js/es/function', /^es\.function\./);
superset('core-js/es/json', /^es\.json\./);
superset('core-js/es/map', /^es\.map/);
superset('core-js/es/math', /^es\.math\./);
superset('core-js/es/number', /^es\.number\./);
superset('core-js/es/object', /^es\.object\./);
superset('core-js/es/promise', /^es\.promise/);
superset('core-js/es/reflect', /^es\.reflect\./);
superset('core-js/es/regexp', /^es\.regexp\./);
superset('core-js/es/set', /^es\.set/);
superset('core-js/es/string', /^es\.string\./);
superset('core-js/es/symbol', /^es\.symbol/);
superset('core-js/es/typed-array', /^es\.typed-array\./);
superset('core-js/es/weak-map', /^es\.weak-map/);
superset('core-js/es/weak-set', /^es\.weak-set/);
equal('core-js/web', /^web\./);
equal('core-js/stable', /^(es|web)\./);
superset('core-js/stable/array', /^es\.array\./);
superset('core-js/stable/array-buffer', /^es\.array-buffer\./);
superset('core-js/stable/data-view', /^es\.data-view\./);
superset('core-js/stable/date', /^es\.date\./);
superset('core-js/stable/dom-collections', /^web\.dom-collections\./);
superset('core-js/stable/function', /^es\.function\./);
superset('core-js/stable/json', /^es\.json\./);
superset('core-js/stable/map', /^es\.map/);
superset('core-js/stable/math', /^es\.math\./);
superset('core-js/stable/number', /^es\.number\./);
superset('core-js/stable/object', /^es\.object\./);
superset('core-js/stable/promise', /^es\.promise/);
superset('core-js/stable/reflect', /^es\.reflect\./);
superset('core-js/stable/regexp', /^es\.regexp\./);
superset('core-js/stable/set', /^es\.set/);
superset('core-js/stable/string', /^es\.string\./);
superset('core-js/stable/symbol', /^es\.symbol/);
superset('core-js/stable/typed-array', /^es\.typed-array\./);
superset('core-js/stable/url', /^web\.url(\.|$)/);
superset('core-js/stable/url-search-params', /^web\.url-search-params/);
superset('core-js/stable/weak-map', /^es\.weak-map/);
superset('core-js/stable/weak-set', /^es\.weak-set/);
equal('core-js/features', allModules);
superset('core-js/features/array', /^(es|esnext)\.array\./);
superset('core-js/features/array-buffer', /^(es|esnext)\.array-buffer\./);
superset('core-js/features/async-iterator', /^(es|esnext)\.async-iterator\./);
equal('core-js/features/bigint', /^(es|esnext)\.bigint\./);
superset('core-js/features/data-view', /^(es|esnext)\.data-view\./);
superset('core-js/features/date', /^(es|esnext)\.date\./);
superset('core-js/features/dom-collections', /^web\.dom-collections\./);
superset('core-js/features/function', /^(es|esnext)\.function\./);
superset('core-js/features/iterator', /^(es|esnext)\.iterator\./);
superset('core-js/features/json', /^(es|esnext)\.json\./);
superset('core-js/features/map', /^(es|esnext)\.map/);
superset('core-js/features/math', /^(es|esnext)\.math\./);
superset('core-js/features/number', /^(es|esnext)\.number\./);
superset('core-js/features/object', /^(es|esnext)\.object\./);
superset('core-js/features/observable', /^(es|esnext)\.observable/);
superset('core-js/features/promise', /^(es|esnext)\.promise/);
superset('core-js/features/reflect', /^(es|esnext)\.reflect\./);
superset('core-js/features/regexp', /^(es|esnext)\.regexp\./);
superset('core-js/features/set', /^(es|esnext)\.set/);
superset('core-js/features/string', /^(es|esnext)\.string\./);
superset('core-js/features/symbol', /^(es|esnext)\.symbol/);
superset('core-js/features/typed-array', /^(es|esnext)\.typed-array\./);
superset('core-js/features/url', /^web\.url(\.|$)/);
superset('core-js/features/url-search-params', /^web\.url-search-params/);
superset('core-js/features/weak-map', /^(es|esnext)\.weak-map/);
superset('core-js/features/weak-set', /^(es|esnext)\.weak-set/);
equal('core-js/proposals', /^(es\.(map|set|weak-map)|esnext\.|web\.url)/);
equal('core-js/stage', /^(es\.(map|set|weak-map)|esnext\.|web\.url)/);
equal('core-js/stage/pre', /^(es\.(map|set|weak-map)|esnext\.|web\.url)/);
subset('core-js/stage/0', /^(es\.map|esnext\.|web\.url)/);
subset('core-js/stage/1', /^(es\.map|esnext\.|web\.url)/);
subset('core-js/stage/2', /^esnext\./);
subset('core-js/stage/3', /^esnext\./);
subset('core-js/stage/4', /^esnext\./);

// eslint-disable-next-line no-console -- output
console.log('\u001B[32mentry points content tested\u001B[0m');
