'use strict';
const { deepStrictEqual, ok } = require('assert');
const data = require('../packages/core-js-compat/data');
const entries = require('../packages/core-js-compat/entries');

const modules = Object.keys(data);

function same(a, b) {
  deepStrictEqual(new Set(a), new Set(b));
}

function superset(a, b) {
  const set = new Set(a);
  for (const module of b) {
    ok(set.has(module), module);
  }
}

same(entries['core-js'], modules);
same(entries['core-js/es'], modules.filter(it => /^es\./.test(it)));
superset(entries['core-js/es/array'], modules.filter(it => /^es\.array\./.test(it)));
superset(entries['core-js/es/array-buffer'], modules.filter(it => /^es\.array-buffer\./.test(it)));
superset(entries['core-js/es/data-view'], modules.filter(it => /^es\.data-view\./.test(it)));
superset(entries['core-js/es/date'], modules.filter(it => /^es\.date\./.test(it)));
superset(entries['core-js/es/function'], modules.filter(it => /^es\.function\./.test(it)));
superset(entries['core-js/es/json'], modules.filter(it => /^es\.json\./.test(it)));
superset(entries['core-js/es/map'], modules.filter(it => /^es\.map/.test(it)));
superset(entries['core-js/es/math'], modules.filter(it => /^es\.math\./.test(it)));
superset(entries['core-js/es/number'], modules.filter(it => /^es\.number\./.test(it)));
superset(entries['core-js/es/object'], modules.filter(it => /^es\.object\./.test(it)));
superset(entries['core-js/es/promise'], modules.filter(it => /^es\.promise/.test(it)));
superset(entries['core-js/es/reflect'], modules.filter(it => /^es\.reflect\./.test(it)));
superset(entries['core-js/es/regexp'], modules.filter(it => /^es\.regexp\./.test(it)));
superset(entries['core-js/es/set'], modules.filter(it => /^es\.set/.test(it)));
superset(entries['core-js/es/string'], modules.filter(it => /^es\.string\./.test(it)));
superset(entries['core-js/es/symbol'], modules.filter(it => /^es\.symbol/.test(it)));
superset(entries['core-js/es/typed-array'], modules.filter(it => /^es\.typed-array\./.test(it)));
superset(entries['core-js/es/weak-map'], modules.filter(it => /^es\.weak-map/.test(it)));
superset(entries['core-js/es/weak-set'], modules.filter(it => /^es\.weak-set/.test(it)));
same(entries['core-js/web'], modules.filter(it => /^web\./.test(it)));
same(entries['core-js/stable'], modules.filter(it => !/^esnext\./.test(it)));
superset(entries['core-js/stable/array'], modules.filter(it => /^es\.array\./.test(it)));
superset(entries['core-js/stable/array-buffer'], modules.filter(it => /^es\.array-buffer\./.test(it)));
superset(entries['core-js/stable/data-view'], modules.filter(it => /^es\.data-view\./.test(it)));
superset(entries['core-js/stable/date'], modules.filter(it => /^es\.date\./.test(it)));
superset(entries['core-js/stable/dom-collections'], modules.filter(it => /^web\.dom-collections\./.test(it)));
superset(entries['core-js/stable/function'], modules.filter(it => /^es\.function\./.test(it)));
superset(entries['core-js/stable/json'], modules.filter(it => /^es\.json\./.test(it)));
superset(entries['core-js/stable/map'], modules.filter(it => /^es\.map/.test(it)));
superset(entries['core-js/stable/math'], modules.filter(it => /^es\.math\./.test(it)));
superset(entries['core-js/stable/number'], modules.filter(it => /^es\.number\./.test(it)));
superset(entries['core-js/stable/object'], modules.filter(it => /^es\.object\./.test(it)));
superset(entries['core-js/stable/promise'], modules.filter(it => /^es\.promise/.test(it)));
superset(entries['core-js/stable/reflect'], modules.filter(it => /^es\.reflect\./.test(it)));
superset(entries['core-js/stable/regexp'], modules.filter(it => /^es\.regexp\./.test(it)));
superset(entries['core-js/stable/set'], modules.filter(it => /^es\.set/.test(it)));
superset(entries['core-js/stable/string'], modules.filter(it => /^es\.string\./.test(it)));
superset(entries['core-js/stable/symbol'], modules.filter(it => /^es\.symbol/.test(it)));
superset(entries['core-js/stable/typed-array'], modules.filter(it => /^es\.typed-array\./.test(it)));
superset(entries['core-js/stable/url'], modules.filter(it => /^web\.url(\.|$)/.test(it)));
superset(entries['core-js/stable/url-search-params'], modules.filter(it => /^web\.url-search-params/.test(it)));
superset(entries['core-js/stable/weak-map'], modules.filter(it => /^es\.weak-map/.test(it)));
superset(entries['core-js/stable/weak-set'], modules.filter(it => /^es\.weak-set/.test(it)));
same(entries['core-js/features'], modules);
superset(entries['core-js/features/array'], modules.filter(it => /^(es|esnext)\.array\./.test(it)));
superset(entries['core-js/features/array-buffer'], modules.filter(it => /^(es|esnext)\.array-buffer\./.test(it)));
superset(entries['core-js/features/async-iterator'], modules.filter(it => /^(es|esnext)\.async-iterator\./.test(it)));
superset(entries['core-js/features/data-view'], modules.filter(it => /^(es|esnext)\.data-view\./.test(it)));
superset(entries['core-js/features/date'], modules.filter(it => /^(es|esnext)\.date\./.test(it)));
superset(entries['core-js/features/dom-collections'], modules.filter(it => /^web\.dom-collections\./.test(it)));
superset(entries['core-js/features/function'], modules.filter(it => /^(es|esnext)\.function\./.test(it)));
superset(entries['core-js/features/iterator'], modules.filter(it => /^(es|esnext)\.iterator\./.test(it)));
superset(entries['core-js/features/json'], modules.filter(it => /^(es|esnext)\.json\./.test(it)));
superset(entries['core-js/features/map'], modules.filter(it => /^(es|esnext)\.map/.test(it)));
superset(entries['core-js/features/math'], modules.filter(it => /^(es|esnext)\.math\./.test(it)));
superset(entries['core-js/features/number'], modules.filter(it => /^(es|esnext)\.number\./.test(it)));
superset(entries['core-js/features/object'], modules.filter(it => /^(es|esnext)\.object\./.test(it)));
superset(entries['core-js/features/observable'], modules.filter(it => /^(es|esnext)\.observable/.test(it)));
superset(entries['core-js/features/promise'], modules.filter(it => /^(es|esnext)\.promise/.test(it)));
superset(entries['core-js/features/reflect'], modules.filter(it => /^(es|esnext)\.reflect\./.test(it)));
superset(entries['core-js/features/regexp'], modules.filter(it => /^(es|esnext)\.regexp\./.test(it)));
superset(entries['core-js/features/set'], modules.filter(it => /^(es|esnext)\.set/.test(it)));
superset(entries['core-js/features/string'], modules.filter(it => /^(es|esnext)\.string\./.test(it)));
superset(entries['core-js/features/symbol'], modules.filter(it => /^(es|esnext)\.symbol/.test(it)));
superset(entries['core-js/features/typed-array'], modules.filter(it => /^(es|esnext)\.typed-array\./.test(it)));
superset(entries['core-js/features/url'], modules.filter(it => /^web\.url(\.|$)/.test(it)));
superset(entries['core-js/features/url-search-params'], modules.filter(it => /^web\.url-search-params/.test(it)));
superset(entries['core-js/features/weak-map'], modules.filter(it => /^(es|esnext)\.weak-map/.test(it)));
superset(entries['core-js/features/weak-set'], modules.filter(it => /^(es|esnext)\.weak-set/.test(it)));
