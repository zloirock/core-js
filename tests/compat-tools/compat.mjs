import { deepEqual, ok, throws } from 'node:assert/strict';
import compat from 'core-js-compat/compat.js';

deepEqual(compat({
  modules: [
    'core-js/es/math',
    'es.array.at',
    /^es\.reflect/,
  ],
  exclude: [
    'es.reflect.prevent-extensions',
  ],
  targets: 'firefox 27',
}), {
  list: [
    'es.array.at',
    'es.array.iterator',
    'es.math.acosh',
    'es.math.asinh',
    'es.math.atanh',
    'es.math.cbrt',
    'es.math.clz32',
    'es.math.expm1',
    'es.math.f16round',
    'es.math.log1p',
    'es.math.log2',
    'es.math.sum-precise',
    'es.math.to-string-tag',
    'es.reflect.apply',
    'es.reflect.construct',
    'es.reflect.define-property',
    'es.reflect.delete-property',
    'es.reflect.get',
    'es.reflect.get-own-property-descriptor',
    'es.reflect.get-prototype-of',
    'es.reflect.has',
    'es.reflect.is-extensible',
    'es.reflect.own-keys',
    'es.reflect.set',
    'es.reflect.set-prototype-of',
    'es.reflect.to-string-tag',
  ],
  targets: {
    'es.array.at': { firefox: '27' },
    'es.array.iterator': { firefox: '27' },
    'es.math.acosh': { firefox: '27' },
    'es.math.asinh': { firefox: '27' },
    'es.math.atanh': { firefox: '27' },
    'es.math.cbrt': { firefox: '27' },
    'es.math.clz32': { firefox: '27' },
    'es.math.expm1': { firefox: '27' },
    'es.math.f16round': { firefox: '27' },
    'es.math.log1p': { firefox: '27' },
    'es.math.log2': { firefox: '27' },
    'es.math.sum-precise': { firefox: '27' },
    'es.math.to-string-tag': { firefox: '27' },
    'es.reflect.apply': { firefox: '27' },
    'es.reflect.construct': { firefox: '27' },
    'es.reflect.define-property': { firefox: '27' },
    'es.reflect.delete-property': { firefox: '27' },
    'es.reflect.get': { firefox: '27' },
    'es.reflect.get-own-property-descriptor': { firefox: '27' },
    'es.reflect.get-prototype-of': { firefox: '27' },
    'es.reflect.has': { firefox: '27' },
    'es.reflect.is-extensible': { firefox: '27' },
    'es.reflect.own-keys': { firefox: '27' },
    'es.reflect.set': { firefox: '27' },
    'es.reflect.set-prototype-of': { firefox: '27' },
    'es.reflect.to-string-tag': { firefox: '27' },
  },
}, 'basic');

deepEqual(compat({
  modules: [
    /^es\.math\.a/,
    /^es\.math\.c/,
  ],
  exclude: 'es.math.asinh',
}), {
  list: [
    'es.math.acosh',
    'es.math.atanh',
    'es.math.cbrt',
    'es.math.clz32',
    'es.math.cosh',
  ],
  targets: {
    'es.math.acosh': {},
    'es.math.atanh': {},
    'es.math.cbrt': {},
    'es.math.clz32': {},
    'es.math.cosh': {},
  },
}, 'no target');

deepEqual(compat({
  modules: /^es\.math\.a/,
}), {
  list: [
    'es.math.acosh',
    'es.math.asinh',
    'es.math.atanh',
  ],
  targets: {
    'es.math.acosh': {},
    'es.math.asinh': {},
    'es.math.atanh': {},
  },
}, 'no exclude');

deepEqual(compat({ exclude: null }), compat(), 'exclude: null means no exclusions');

for (const exclude of [false, 0, [null]]) {
  throws(() => compat({ exclude }), TypeError, `invalid exclude: ${ JSON.stringify(exclude) }`);
}

for (const exclude of [
  'es.array.at',
  /^es\.array\.at$/,
  ['es.array.at'],
  'core-js/stable/array/at',
  'esnext.array.at',
  /^esnext\.array\.at$/,
  ['esnext.array.at'],
  'core-js/proposals/relative-indexing-method',
]) {
  deepEqual(compat({
    modules: ['es.array.at', 'esnext.array.at'],
    exclude,
    targets: 'ie 11',
  }), { list: [], targets: {} }, `exclude stabilized aliases: ${ JSON.stringify(exclude) }`);
}

deepEqual(compat({
  modules: 'esnext.array.at',
  exclude: 'es.array.at',
  targets: 'ie 11',
}), { list: [], targets: {} }, 'exclude a stable module when only its alias is selected');

for (const exclude of ['es.array.at', 'esnext.array.at']) {
  deepEqual(compat({
    modules: ['es.array.at', 'esnext.array.at'],
    exclude,
    targets: 'chrome 100',
    inverse: true,
  }), { list: [], targets: {} }, 'inverse respects excluded stabilized aliases');
}

deepEqual(compat({
  modules: ['es.math.f16round', 'esnext.math.f16round', 'esnext.math.clamp'],
  exclude: /^es\.math\./,
  targets: 'ie 11',
}), {
  list: ['esnext.math.clamp'],
  targets: { 'esnext.math.clamp': { ie: '11' } },
}, 'excluding stable math modules preserves unrelated proposals');

deepEqual(compat({
  modules: 'es.array.at',
  exclude: 'esnext.array.at',
  targets: 'ie 11',
}), { list: [], targets: {} }, 'exclude an alias when only its stable module is selected');

const noTargets = compat();

for (const targets of [
  {},
  [],
  { browsers: '' },
  { browsers: [] },
  { browsers: {} },
  { esmodules: false },
  { esmodules: 'intersect' },
  { esmodules: 'intersect', browsers: 'ie 11' },
  'kaios 2.5',
  'and_uc 15.5',
  'op_mini all',
  { ios_safari: '12' },
  { edge_chromium: 90 },
]) {
  deepEqual(compat({ targets }), noTargets, `empty targets: ${ JSON.stringify(targets) }`);
  deepEqual(compat({ targets, inverse: true }), { list: [], targets: {} }, `empty inverse targets: ${ JSON.stringify(targets) }`);
}

deepEqual(
  compat({ targets: 'chrome 100, kaios 2.5' }),
  compat({ targets: { chrome: '100' } }),
  'untracked engines do not disable filtering for tracked engines',
);

deepEqual(
  compat({ targets: { chrome: 93 } }),
  compat({ modules: 'core-js', targets: { chrome: 93 } }),
  'no modules',
);

deepEqual(compat({
  modules: 'core-js/es/math',
  targets: {
    chrome: 40,
    firefox: 27,
  },
}), {
  list: [
    'es.array.iterator',
    'es.math.acosh',
    'es.math.asinh',
    'es.math.atanh',
    'es.math.cbrt',
    'es.math.clz32',
    'es.math.expm1',
    'es.math.f16round',
    'es.math.hypot',
    'es.math.log10',
    'es.math.log1p',
    'es.math.log2',
    'es.math.sum-precise',
    'es.math.tanh',
    'es.math.to-string-tag',
  ],
  targets: {
    'es.array.iterator': { chrome: '40', firefox: '27' },
    'es.math.acosh': { chrome: '40', firefox: '27' },
    'es.math.asinh': { chrome: '40', firefox: '27' },
    'es.math.atanh': { chrome: '40', firefox: '27' },
    'es.math.cbrt': { firefox: '27' },
    'es.math.clz32': { firefox: '27' },
    'es.math.expm1': { firefox: '27' },
    'es.math.f16round': { chrome: '40', firefox: '27' },
    'es.math.hypot': { chrome: '40' },
    'es.math.log10': { chrome: '40' },
    'es.math.log1p': { firefox: '27' },
    'es.math.log2': { chrome: '40', firefox: '27' },
    'es.math.sum-precise': { chrome: '40', firefox: '27' },
    'es.math.tanh': { chrome: '40' },
    'es.math.to-string-tag': { chrome: '40', firefox: '27' },
  },
}, 'some targets');

deepEqual(
  compat({ targets: 'and_chr >= 80, and_ff >= 68, Android >= 5' }),
  compat({ targets: { android: '37', 'chrome-android': '80', 'firefox-android': '68' } }),
  'mobile browserslist ranges include all required polyfills',
);

for (const targets of ['safari TP', { safari: 'tp' }, { browsers: { safari: 'latest' } }]) {
  deepEqual(compat({ modules: ['es.array.at', 'esnext.array.filter-out'], targets }), {
    list: ['esnext.array.filter-out'],
    targets: { 'esnext.array.filter-out': { safari: '999999' } },
  }, 'latest Safari needs polyfills only for unsupported features');
}

const { list: inverted1 } = compat({ targets: { esmodules: true }, inverse: true });

ok(inverted1.includes('es.symbol.iterator'), 'inverse #1');
ok(!inverted1.includes('esnext.iterator.from'), 'inverse #2');
ok(!inverted1.includes('esnext.array.at'), 'inverse #3');

const { list: inverted2 } = compat({ modules: 'core-js/es/math', targets: { esmodules: true }, inverse: true });

ok(inverted2.includes('es.math.acosh'), 'inverse #4');
ok(!inverted2.includes('es.map'), 'inverse #5');

echo(chalk.green('compat tool tested'));
