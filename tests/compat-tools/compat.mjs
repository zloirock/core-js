import { deepEqual, ok } from 'node:assert/strict';
import compat from '@core-js/compat/compat.js';

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
    'es.object.to-string',
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
    'es.array.at',
    'es.math.clz32',
    'es.math.expm1',
    'es.math.f16round',
    'es.math.to-string-tag',
  ],
  targets: {
    'es.object.to-string': { firefox: '27' },
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
    'es.array.at': { firefox: '27' },
    'es.math.clz32': { firefox: '27' },
    'es.math.expm1': { firefox: '27' },
    'es.math.f16round': { firefox: '27' },
    'es.math.to-string-tag': { firefox: '27' },
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
    'es.object.to-string',
    'es.math.acosh',
    'es.math.clz32',
    'es.math.expm1',
    'es.math.f16round',
    'es.math.hypot',
    'es.math.to-string-tag',
  ],
  targets: {
    'es.object.to-string': { chrome: '40', firefox: '27' },
    'es.math.acosh': { chrome: '40' },
    'es.math.clz32': { firefox: '27' },
    'es.math.expm1': { firefox: '27' },
    'es.math.f16round': { chrome: '40', firefox: '27' },
    'es.math.hypot': { chrome: '40' },
    'es.math.to-string-tag': { chrome: '40', firefox: '27' },
  },
}, 'some targets');

const { list: inverted1 } = compat({ targets: { esmodules: true }, inverse: true });

ok(inverted1.includes('es.symbol.iterator'), 'inverse #1');
ok(!inverted1.includes('esnext.iterator.from'), 'inverse #2');
// TODO: enable after adding new stabilized aliases in `core-js@4`
// ok(!inverted1.includes('esnext.array.at'), 'inverse #3');

const { list: inverted2 } = compat({ modules: 'core-js/es/math', targets: { esmodules: true }, inverse: true });

ok(inverted2.includes('es.math.acosh'), 'inverse #4');
ok(!inverted2.includes('es.map.constructor'), 'inverse #5');

echo(chalk.green('compat tool tested'));
