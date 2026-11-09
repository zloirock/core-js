import { GLOBAL, DESCRIPTORS, NODE, BUN, DENO, DENO_VERSION } from '../helpers/constants.js';
import { createIterable } from '../helpers/helpers.js';

const { create, defineProperty, getPrototypeOf, getOwnPropertyDescriptor } = Object;

const { Proxy } = GLOBAL;

const USV_STRINGS = [
  ['\uD800', '\uFFFD'],
  ['\uDBFF', '\uFFFD'],
  ['\uDC00', '\uFFFD'],
  ['\uDFFF', '\uFFFD'],
  ['a\uD800b', 'a\uFFFDb'],
  ['\uDC00\uD800', '\uFFFD\uFFFD'],
  ['\uD800\uD800\uDC00', '\uFFFD\uD800\uDC00'],
  ['\uD800\uDC00', '\uD800\uDC00'],
  ['\uDBFF\uDFFF', '\uDBFF\uDFFF'],
];

const DENO_PATCH = DENO_VERSION ? +GLOBAL.Deno.version.deno.split('.')[2] : 0;
// Deno 1.2-1.11.1 lacks USVString conversion in sequence / record input and methods: https://github.com/denoland/deno/pull/11005
const DENO_OLD_RECORD = DENO_VERSION >= 102 && (DENO_VERSION < 111 || DENO_VERSION === 111 && DENO_PATCH < 2);
// Deno 1.2-1.10.2 leaves raw surrogates in string input or throws; fixed in 1.10.3.
// https://github.com/denoland/deno/pull/10156
const DENO_OLD_STRING = DENO_VERSION >= 102 && (DENO_VERSION < 110 || DENO_VERSION === 110 && DENO_PATCH < 3);
// Deno 1.11.2 incorrectly uses ByteString for sequence and record initializers; fixed in 1.11.3.
// https://github.com/denoland/deno/pull/11101
const DENO_BYTE_STRING = DENO_VERSION === 111 && DENO_PATCH === 2;
// Deno 1.14.3 reads and converts record values twice; fixed in 1.15.0.
// https://github.com/denoland/deno/pull/12286
// https://github.com/denoland/deno/pull/12336
const DENO_RECORD_DOUBLE_READ = DENO_VERSION === 114 && DENO_PATCH === 3;
const nodeVersion = NODE ? GLOBAL.process.versions.node.split('.') : [];
const NODE_VERSION = NODE ? nodeVersion[0] * 100 + +nodeVersion[1] : 0;
// Node 10-16.16 and 17.0-17.3 do not merge converted record keys; fixed in 16.17 and 17.4.
// https://github.com/nodejs/node/pull/41197
const NODE_RECORD_COLLISIONS = NODE_VERSION >= 1000 && (NODE_VERSION < 1617 || NODE_VERSION >= 1700 && NODE_VERSION < 1704);
// Node 16.17-16.20, 17.4-18.16 and 19 drop own keys shadowing Object.prototype.
// Fixed in 18.17 and 20.0: https://github.com/nodejs/node/pull/47415
const NODE_RECORD_PROTOTYPE = NODE_VERSION >= 1617 && NODE_VERSION < 1700
  || NODE_VERSION >= 1704 && NODE_VERSION < 1817 || NODE_VERSION >= 1900 && NODE_VERSION < 2000;
const CHROMIUM_VERSION = +(/(?:Chrome|Chromium)\/(\d+)/.exec(GLOBAL.navigator?.userAgent)?.[1] || 0);
// Chrome 67-115 / Edge 79-115 corrupt U+10FFFF in string input; fixed in Chromium 116.
// https://crbug.com/1416021
const CHROMIUM_UTF8_NONCHARACTERS = CHROMIUM_VERSION >= 67 && CHROMIUM_VERSION < 116;
// Deno 1.15.0-2.7.14: https://github.com/denoland/deno/pull/12336
// Fixed in 2.8.0: https://github.com/denoland/deno/pull/34119
const DENO_RECORD_SYMBOLS = DENO_OLD_RECORD || DENO_VERSION >= 115 && DENO_VERSION < 208;
// Property changes also fail in Deno 1.14.3: https://github.com/denoland/deno/pull/12286
const DENO_RECORD_CHANGES = DENO_RECORD_SYMBOLS || DENO_VERSION === 114 && DENO_PATCH >= 3;
// Safari 14.0.1-14.1.2 ignores symbol keys; fixed in Safari 15.
// https://bugs.webkit.org/show_bug.cgi?id=223231
const SAFARI_14 = /Version\/14(?:\.\d+)* Safari\/|(?:iPad|iPhone|iPod).*OS 14_/.test(GLOBAL.navigator?.userAgent);

QUnit.test('URLSearchParams', assert => {
  assert.isFunction(URLSearchParams);
  assert.arity(URLSearchParams, 0);
  assert.name(URLSearchParams, 'URLSearchParams');
  // Deno 1.x implements this API in JavaScript without native-looking source strings.
  if (!NODE && !DENO) assert.looksNative(URLSearchParams);

  assert.same(String(new URLSearchParams()), '');
  assert.same(String(new URLSearchParams('')), '');
  assert.same(String(new URLSearchParams('a=b')), 'a=b');
  assert.same(String(new URLSearchParams(new URLSearchParams('a=b'))), 'a=b');
  assert.same(String(new URLSearchParams([])), '');
  assert.same(String(new URLSearchParams([[1, 2], ['a', 'b']])), '1=2&a=b');
  // Deno 1.10 rejects custom iterable pairs; the pure implementation covers this case.
  if (DENO_VERSION !== 110) assert.same(String(new URLSearchParams(createIterable([createIterable(['a', 'b']), createIterable(['c', 'd'])]))), 'a=b&c=d');
  assert.same(String(new URLSearchParams({})), '');
  assert.same(String(new URLSearchParams({ 1: 2, a: 'b' })), '1=2&a=b');

  assert.same(String(new URLSearchParams('?a=b')), 'a=b', 'leading ? should be ignored');
  assert.same(String(new URLSearchParams('??a=b')), '%3Fa=b');

  // a lone surrogate is percent-encoded as U+FFFD, https://encoding.spec.whatwg.org/#utf-8-encoder
  assert.same(String(new URLSearchParams([['k', 'a\uD800b']])), 'k=a%EF%BF%BDb', 'lone surrogate in a value');
  assert.same(String(new URLSearchParams([['a\uD800b', 'v']])), 'a%EF%BF%BDb=v', 'lone surrogate in a key');
  assert.same(String(new URLSearchParams([['k', '\uDC00\uD800']])), 'k=%EF%BF%BD%EF%BF%BD', 'reversed surrogates');
  assert.same(String(new URLSearchParams([['k', '\uD83D\uDE00']])), 'k=%F0%9F%98%80', 'surrogate pair is kept');
  // assert.same(new URLSearchParams('a=%ED%A0%80').get('a'), '\uFFFD\uFFFD\uFFFD', 'percent-encoded surrogate decodes to U+FFFD'); // '\u00ED\u00A0\u0080' in Chrome 67
  assert.same(String(new URLSearchParams('?')), '');
  assert.same(String(new URLSearchParams('??')), '%3F=');

  assert.same(String(new URLSearchParams('a=b c')), 'a=b+c');
  assert.same(String(new URLSearchParams('a=b&b=c&a=d')), 'a=b&b=c&a=d');

  assert.same(String(new URLSearchParams('a==')), 'a=%3D');
  assert.same(String(new URLSearchParams('a=b=')), 'a=b%3D');
  assert.same(String(new URLSearchParams('a=b=c')), 'a=b%3Dc');
  assert.same(String(new URLSearchParams('a==b')), 'a=%3Db');

  let params = new URLSearchParams('a=b');
  assert.true(params.has('a'), 'search params object has name "a"');
  assert.false(params.has('b'), 'search params object has not got name "b"');

  params = new URLSearchParams('a=b&c');
  assert.true(params.has('a'), 'search params object has name "a"');
  assert.true(params.has('c'), 'search params object has name "c"');

  params = new URLSearchParams('&a&&& &&&&&a+b=& c&m%c3%b8%c3%b8');
  assert.true(params.has('a'), 'search params object has name "a"');
  assert.true(params.has('a b'), 'search params object has name "a b"');
  assert.true(params.has(' '), 'search params object has name " "');
  assert.false(params.has('c'), 'search params object did not have the name "c"');
  assert.true(params.has(' c'), 'search params object has name " c"');
  assert.true(params.has('møø'), 'search params object has name "møø"');

  params = new URLSearchParams('a=b+c');
  assert.same(params.get('a'), 'b c', 'parse +');
  params = new URLSearchParams('a+b=c');
  assert.same(params.get('a b'), 'c', 'parse +');

  params = new URLSearchParams('a=b c');
  assert.same(params.get('a'), 'b c', 'parse " "');
  params = new URLSearchParams('a b=c');
  assert.same(params.get('a b'), 'c', 'parse " "');

  params = new URLSearchParams('a=b%20c');
  assert.same(params.get('a'), 'b c', 'parse %20');
  params = new URLSearchParams('a%20b=c');
  assert.same(params.get('a b'), 'c', 'parse %20');

  params = new URLSearchParams('a=b\0c');
  assert.same(params.get('a'), 'b\0c', 'parse \\0');
  params = new URLSearchParams('a\0b=c');
  assert.same(params.get('a\0b'), 'c', 'parse \\0');

  params = new URLSearchParams('a=b%00c');
  assert.same(params.get('a'), 'b\0c', 'parse %00');
  params = new URLSearchParams('a%00b=c');
  assert.same(params.get('a\0b'), 'c', 'parse %00');

  params = new URLSearchParams('a=b\u2384');
  assert.same(params.get('a'), 'b\u2384', 'parse \u2384');
  params = new URLSearchParams('a\u2384b=c');
  assert.same(params.get('a\u2384b'), 'c', 'parse \u2384');

  params = new URLSearchParams('a=b%e2%8e%84');
  assert.same(params.get('a'), 'b\u2384', 'parse %e2%8e%84');
  params = new URLSearchParams('a%e2%8e%84b=c');
  assert.same(params.get('a\u2384b'), 'c', 'parse %e2%8e%84');

  params = new URLSearchParams('a=b\uD83D\uDCA9c');
  assert.same(params.get('a'), 'b\uD83D\uDCA9c', 'parse \uD83D\uDCA9');
  params = new URLSearchParams('a\uD83D\uDCA9b=c');
  assert.same(params.get('a\uD83D\uDCA9b'), 'c', 'parse \uD83D\uDCA9');

  params = new URLSearchParams('a=b%f0%9f%92%a9c');
  assert.same(params.get('a'), 'b\uD83D\uDCA9c', 'parse %f0%9f%92%a9');
  params = new URLSearchParams('a%f0%9f%92%a9b=c');
  assert.same(params.get('a\uD83D\uDCA9b'), 'c', 'parse %f0%9f%92%a9');

  params = new URLSearchParams();
  params.set('query', '+15555555555');
  assert.same(params.toString(), 'query=%2B15555555555');
  assert.same(params.get('query'), '+15555555555', 'parse encoded +');
  params = new URLSearchParams(params.toString());
  assert.same(params.get('query'), '+15555555555', 'parse encoded +');

  params = new URLSearchParams('b=%2sf%2a');
  assert.same(params.get('b'), '%2sf*', 'parse encoded %2sf%2a');
  // Native Node 10-11, 12 < 12.19.0, 13 and 14 < 14.10.0 mishandle the invalid percent prefix.
  // https://github.com/nodejs/node/pull/35013
  // params = new URLSearchParams('b=%%2a');
  // assert.same(params.get('b'), '%*', 'parse encoded b=%%2a');

  assert.same(String(new URLSearchParams('%25')), '%25=');
  assert.same(String(new URLSearchParams('%4')), '%254=');

  // invalid UTF-8 is decoded byte by byte in Chrome 67
  if (String(new URLSearchParams('%C2')) === '%EF%BF%BD=') {
    assert.same(String(new URLSearchParams('%C2')), '%EF%BF%BD=');
    assert.same(String(new URLSearchParams('%F0%9F%D0%90')), '%EF%BF%BD%D0%90=');
    assert.same(String(new URLSearchParams('%C3%ZZ')), '%EF%BF%BD%25ZZ=', 'invalid hex in continuation byte preserved');

    // overlong UTF-8 encodings
    assert.same(String(new URLSearchParams('%C0%AF')), '%EF%BF%BD%EF%BF%BD=', 'overlong 2-byte slash');
    assert.same(String(new URLSearchParams('%C0%80')), '%EF%BF%BD%EF%BF%BD=', 'overlong 2-byte NUL');
    assert.same(String(new URLSearchParams('%E0%80%AF')), '%EF%BF%BD%EF%BF%BD%EF%BF%BD=', 'overlong 3-byte slash');
    assert.same(String(new URLSearchParams('%F0%80%80%AF')), '%EF%BF%BD%EF%BF%BD%EF%BF%BD%EF%BF%BD=', 'overlong 4-byte slash');

    // surrogate codepoints encoded in UTF-8
    assert.same(String(new URLSearchParams('%ED%A0%80')), '%EF%BF%BD%EF%BF%BD%EF%BF%BD=', 'UTF-8 encoded U+D800');
    assert.same(String(new URLSearchParams('%ED%BF%BF')), '%EF%BF%BD%EF%BF%BD%EF%BF%BD=', 'UTF-8 encoded U+DFFF');

    // incomplete sequences with out-of-range continuation bytes per WHATWG encoding spec
    assert.same(String(new URLSearchParams('%ED%A0')), '%EF%BF%BD%EF%BF%BD=', 'incomplete surrogate: ED A0');
    assert.same(String(new URLSearchParams('%E0%80')), '%EF%BF%BD%EF%BF%BD=', 'incomplete overlong 3-byte: E0 80');
    assert.same(String(new URLSearchParams('%F0%80%80')), '%EF%BF%BD%EF%BF%BD%EF%BF%BD=', 'incomplete overlong 4-byte: F0 80 80');
    assert.same(String(new URLSearchParams('%F4%90')), '%EF%BF%BD%EF%BF%BD=', 'incomplete out-of-range 4-byte: F4 90');
  }

  const nonASCIIKey = 'd\u1234';
  const testData = [
    { input: '?a=%', output: [['a', '%']], name: 'handling %' },
    { input: { '+': '%C2' }, output: [['+', '%C2']], name: 'object with +' },
    { input: { c: 'x', a: '?' }, output: [['c', 'x'], ['a', '?']], name: 'object with two keys' },
    { input: [['c', 'x'], ['a', '?']], output: [['c', 'x'], ['a', '?']], name: 'array with two keys' },
    {
      input: { 'a\0b': '42', 'c\uD83D': '23', [nonASCIIKey]: 'foo' },
      output: [['a\0b', '42'], ['c\uFFFD', '23'], ['d\u1234', 'foo']],
      name: 'object with NULL, non-ASCII, and surrogate keys',
      skip: DENO_BYTE_STRING,
    },
  ];

  for (const { input, output, name, skip } of testData) {
    if (skip) continue;
    params = new URLSearchParams(input);
    let i = 0;
    params.forEach((value, key) => {
      const [reqKey, reqValue] = output[i++];
      if (!DENO_OLD_RECORD || reqKey !== 'c\uFFFD') assert.same(key, reqKey, `construct with ${ name }`);
      assert.same(value, reqValue, `construct with ${ name }`);
    });
  }

  // https://github.com/oven-sh/bun/issues/9253
  if (!BUN) assert.throws(() => {
    URLSearchParams('');
  }, 'throws w/o `new`');

  assert.throws(() => {
    new URLSearchParams([[1, 2, 3]]);
  }, 'sequence elements must be pairs #1');

  assert.throws(() => {
    new URLSearchParams([createIterable([createIterable([1, 2, 3])])]);
  }, 'sequence elements must be pairs #2');

  assert.throws(() => {
    new URLSearchParams([[1]]);
  }, 'sequence elements must be pairs #3');

  assert.throws(() => {
    new URLSearchParams([createIterable([createIterable([1])])]);
  }, 'sequence elements must be pairs #4');
});

QUnit.test('URLSearchParams USVString initializers', assert => {
  for (const [input, expected] of USV_STRINGS) {
    for (const init of [`${ input }=${ input }`, [[input, input]], { [input]: input }]) {
      if (typeof init === 'string') {
        if (DENO_OLD_STRING && input !== expected || CHROMIUM_UTF8_NONCHARACTERS && input === '\uDBFF\uDFFF') continue;
      } else if (DENO_BYTE_STRING || DENO_OLD_RECORD && input !== expected) continue;
      const entries = [];
      new URLSearchParams(init).forEach((value, key) => entries.push([key, value]));
      assert.arrayEqual(entries, [[expected, expected]], 'initializer keys and values are well-formed');
    }
  }
  if (!DENO_OLD_RECORD && !DENO_BYTE_STRING) {
    const sequence = new URLSearchParams([['\uD800', 'first'], ['\uDC00', 'last']]);
    assert.arrayEqual(sequence.getAll('\uFFFD'), ['first', 'last'], 'sequence entries are not merged');
  }

  const params = new URLSearchParams();
  params.append('\uD800', '\uDC00');
  params.append('\uE000', 'keep');
  params.sort();
  const entries = [];
  params.forEach((value, key) => entries.push([key, value]));
  if (!DENO_OLD_RECORD) assert.arrayEqual(entries, [['\uE000', 'keep'], ['\uFFFD', '\uFFFD']], 'sort uses converted keys');
});

if (!DENO_BYTE_STRING) QUnit.test('URLSearchParams USVString record collisions', assert => {
  for (const record of [
    { '\uD800': 'first', middle: 'keep', '\uDC00': 'last' },
    { '\uFFFD': 'first', middle: 'keep', '\uDFFF': 'last' },
  ]) {
    const entries = [];
    new URLSearchParams(record).forEach((value, key) => entries.push([key, value]));
    if (!NODE_RECORD_COLLISIONS && !DENO_OLD_RECORD) {
      assert.arrayEqual(entries, [['\uFFFD', 'last'], ['middle', 'keep']], 'record collision preserves the first position and last value');
    }
  }

  if (DESCRIPTORS) {
    const log = [];
    const record = {};
    for (const key of ['\uD800', '\uDC00']) defineProperty(record, key, {
      enumerable: true,
      get() {
        log.push(key);
        return {
          toString() {
            log.push('value');
            return key;
          },
        };
      },
    });
    const params = new URLSearchParams(record);
    if (!DENO_RECORD_DOUBLE_READ) assert.arrayEqual(log, ['\uD800', 'value', '\uDC00', 'value'], 'all colliding properties are read and converted');
    if (!NODE_RECORD_COLLISIONS && !DENO_OLD_RECORD) assert.arrayEqual(params.getAll('\uFFFD'), ['\uFFFD'], 'colliding values are well-formed');
  }
});

QUnit.test('URLSearchParams USVString methods', assert => {
  for (const [input, expected] of USV_STRINGS) {
    const wellFormed = !DENO_OLD_RECORD || input === expected;
    let params = new URLSearchParams();
    params.append(input, input);
    if (wellFormed) assert.same(params.get(expected), expected, 'append converts both arguments');
    if (wellFormed) assert.same(params.get(input), expected, 'get converts its name');
    if (wellFormed) assert.arrayEqual(params.getAll(input), [expected], 'getAll converts its name');
    assert.true(params.has(input), 'has converts its name');
    if (wellFormed) assert.true(params.has(expected, input), 'has converts its value');
    assert.true(params.has(input, undefined), 'has ignores an undefined value');
    if (wellFormed) assert.same(params.keys().next().value, expected, 'keys yields converted names');
    if (wellFormed) assert.same(params.values().next().value, expected, 'values yields converted values');
    if (wellFormed) assert.arrayEqual(params.entries().next().value, [expected, expected], 'entries yields converted strings');

    params = new URLSearchParams();
    params.append(expected, 'old');
    params.append(expected, 'duplicate');
    params.append('tail', 'keep');
    params.set(input, input);
    if (wellFormed) assert.arrayEqual(params.getAll(expected), [expected], 'set converts both arguments before matching entries');
    assert.same(params.get('tail'), 'keep', 'set preserves unrelated entries');

    params = new URLSearchParams();
    params.append(expected, expected);
    params.append(expected, 'other');
    params.delete(input, input);
    assert.arrayEqual(params.getAll(expected), ['other'], 'delete converts both arguments');
    params.delete(input);
    if (wellFormed) assert.false(params.has(expected), 'delete converts its name without a value');

    params = new URLSearchParams();
    params.append(expected, expected);
    params.append(expected, 'other');
    params.delete(input, undefined);
    if (wellFormed) assert.false(params.has(expected), 'delete ignores an undefined value');
  }
});

QUnit.test('URLSearchParams USVString coercion', assert => {
  for (const method of ['append', 'set']) {
    const log = [];
    const params = new URLSearchParams();
    params[method]({
      toString() {
        log.push('name');
        return '\uD800';
      },
    }, {
      toString() {
        log.push('value');
        return '\uDC00';
      },
    });
    assert.arrayEqual(log, ['name', 'value'], 'arguments are converted once in order');
    if (!DENO_OLD_RECORD) assert.same(params.get('\uFFFD'), '\uFFFD', 'object arguments are well-formed');
    const error = new Error('key conversion');
    const throwingName = { toString() { throw error; } };
    const unreadValue = { toString() { assert.avoid(); } };
    assert.throws(() => params[method](throwingName, unreadValue), error, 'abrupt name conversion');
    if (!DENO_OLD_RECORD) assert.throws(() => params[method](Symbol('key'), unreadValue), TypeError, 'symbol names throw before value conversion');
    if (!DENO_OLD_RECORD) assert.throws(() => params[method]('key', Symbol('value')), TypeError, 'symbol values throw');
  }
});

QUnit.test('URLSearchParams record keys', assert => {
  for (const key of ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf']) {
    if (!NODE_RECORD_PROTOTYPE) assert.same(String(new URLSearchParams({ [key]: 'value' })), `${ key }=value`, 'own key shadowing Object.prototype');
  }

  const inherited = create({ inherited: 'ignored' });
  inherited.own = 'value';
  assert.same(String(new URLSearchParams(inherited)), 'own=value', 'inherited keys are ignored');
  const nullPrototype = create(null);
  nullPrototype.a = 1;
  assert.same(String(new URLSearchParams(nullPrototype)), 'a=1', 'null prototype');

  const symbol = Symbol('key');
  if (!DENO_RECORD_SYMBOLS && !SAFARI_14) assert.throws(() => new URLSearchParams({ [symbol]: 'value' }), TypeError, 'enumerable symbol key');
  if (!DENO_OLD_RECORD && !SAFARI_14) assert.throws(() => new URLSearchParams({ [Symbol.iterator]: null, a: 1 }), TypeError, 'enumerable null iterator key');

  if (DESCRIPTORS) {
    let reads = 0;
    const record = { a: 1 };
    defineProperty(record, 'hidden', {
      get() {
        reads++;
        return 'ignored';
      },
    });
    defineProperty(record, symbol, {
      configurable: true,
      get() {
        reads++;
        return 'ignored';
      },
    });
    assert.same(String(new URLSearchParams(record)), 'a=1', 'non-enumerable string and symbol keys are ignored');
    assert.same(reads, 0, 'non-enumerable values are not read');
    defineProperty(record, symbol, { enumerable: true });
    if (!DENO_RECORD_SYMBOLS && !SAFARI_14) {
      assert.throws(() => new URLSearchParams(record), TypeError, 'symbol key conversion throws');
      assert.same(reads, 0, 'key conversion precedes value access');
    }
  }
});

if (DESCRIPTORS && !DENO_RECORD_CHANGES) QUnit.test('URLSearchParams record property changes', assert => {
  const record = {};
  defineProperty(record, 'a', {
    enumerable: true,
    get() {
      defineProperty(record, 'b', { enumerable: true });
      defineProperty(record, 'c', { enumerable: false });
      delete record.d;
      record.e = 5;
      return 1;
    },
  });
  defineProperty(record, 'b', { configurable: true, value: 2 });
  defineProperty(record, 'c', { configurable: true, enumerable: true, value: 3 });
  record.d = 4;
  assert.same(String(new URLSearchParams(record)), 'a=1&b=2', 'keys are snapshotted, enumerability and values are read in order');
});

if (typeof Proxy == 'function') QUnit.test('URLSearchParams record proxy traps', assert => {
  const log = [];
  const target = { a: 1, b: 2 };
  defineProperty(target, 'hidden', { value: 3 });
  const record = new Proxy(target, {
    ownKeys() {
      log.push('ownKeys');
      return ['b', 'hidden', 'gone', 'a'];
    },
    getOwnPropertyDescriptor(object, key) {
      log.push(`descriptor ${ key }`);
      return getOwnPropertyDescriptor(object, key);
    },
    get(object, key) {
      if (key === 'a' || key === 'b' || key === 'hidden' || key === 'gone') log.push(`get ${ key }`);
      return object[key];
    },
    getPrototypeOf(object) {
      log.push('getPrototypeOf');
      return getPrototypeOf(object);
    },
  });
  assert.same(String(new URLSearchParams(record)), 'b=2&a=1', 'ownKeys order');
  if (!DENO_OLD_RECORD) {
    assert.arrayEqual(log, ['ownKeys', 'descriptor b', 'get b', 'descriptor hidden', 'descriptor gone', 'descriptor a', 'get a'], 'record enumeration traps');
  }

  const error = new Error('record enumeration');
  assert.throws(() => new URLSearchParams(new Proxy({}, {
    ownKeys() {
      throw error;
    },
  })), error, 'ownKeys error is propagated');
  assert.throws(() => new URLSearchParams(new Proxy({ a: 1 }, {
    getOwnPropertyDescriptor() {
      throw error;
    },
  })), error, 'descriptor error is propagated');
});

QUnit.test('URLSearchParams rejects non-object iterator results', assert => {
  for (const position of [-1, 0, 1, 2]) {
    for (const primitive of [undefined, null, false, 1, 'foo']) {
      let nextCalls = 0;
      let returnCalls = 0;
      const invalidIndex = Math.max(0, position);
      const iterable = createIterable([], {
        next() {
          const index = nextCalls++;
          return index === invalidIndex ? primitive : { value: 'a', done: index > 1 };
        },
        return() {
          returnCalls++;
          return {};
        },
      });
      assert.throws(() => new URLSearchParams(position < 0 ? iterable : [iterable]), TypeError, 'rejects a non-object iterator result');
      assert.same(nextCalls, invalidIndex + 1, 'does not advance after an invalid result');
      assert.same(returnCalls, 0, 'does not close the iterator');
    }
  }
});

// Native Chrome 67-76 decodes invalid UTF-8 as Latin-1; fixed in 77.
// https://chromium-review.googlesource.com/c/chromium/src/+/1669297
QUnit.skip('URLSearchParams invalid UTF-8 lead bytes', assert => {
  // https://encoding.spec.whatwg.org/#utf-8-decoder
  for (const lead of ['80', 'BF', 'C0', 'C1', 'F5', 'F6', 'F7', 'F8', 'FF']) {
    let input = `%${ lead }`;
    let expected = '\uFFFD';
    for (let count = 0; count < 4; count++) {
      const params = new URLSearchParams(`a=${ input }&${ input }=b`);
      assert.same(params.get('a'), expected, `${ input } in a value`);
      assert.same(params.get(expected), 'b', `${ input } in a key`);
      assert.same(new URLSearchParams(`a=${ input }x%41%C2%A2`).get('a'), `${ expected }xA\u00A2`, 'following input is preserved');
      input += '%80';
      expected += '\uFFFD';
    }
  }
});

QUnit.test('URLSearchParams valid UTF-8 boundaries', assert => {
  for (const [input, expected] of [
    ['%C2%80', '\u0080'],
    ['%DF%BF', '\u07FF'],
    ['%E0%A0%80', '\u0800'],
    ['%ED%9F%BF', '\uD7FF'],
    ['%EE%80%80', '\uE000'],
    ['%F0%90%80%80', '\uD800\uDC00'],
  ]) {
    assert.same(new URLSearchParams(`a=${ input }`).get('a'), expected, 'valid UTF-8 boundary');
  }
});

// Native Chrome 67-115 and Edge 79-115 mishandle these UTF-8 noncharacters; fixed in 116.
// https://crbug.com/1416021
// https://chromium-review.googlesource.com/c/chromium/src/+/4567772
QUnit.skip('URLSearchParams UTF-8 noncharacters', assert => {
  assert.same(new URLSearchParams('a=%EF%BF%BF').get('a'), '\uFFFF', 'U+FFFF');
  assert.same(new URLSearchParams('a=%F4%8F%BF%BF').get('a'), '\uDBFF\uDFFF', 'U+10FFFF');
});

QUnit.test('URLSearchParams#append', assert => {
  const { append } = URLSearchParams.prototype;
  assert.isFunction(append);
  assert.arity(append, 2);
  assert.name(append, 'append');
  // Deno 1.10 methods are not enumerable.
  if (DENO_VERSION !== 110) assert.enumerable(URLSearchParams.prototype, 'append');
  // Deno 1.x implements this API in JavaScript without native-looking source strings.
  if (!NODE && !DENO) assert.looksNative(append);

  assert.same(new URLSearchParams().append('a', 'b'), undefined, 'void');

  let params = new URLSearchParams();
  params.append('a', 'b');
  assert.same(String(params), 'a=b');
  params.append('a', 'b');
  assert.same(String(params), 'a=b&a=b');
  params.append('a', 'c');
  assert.same(String(params), 'a=b&a=b&a=c');

  params = new URLSearchParams();
  params.append('', '');
  assert.same(String(params), '=');
  params.append('', '');
  assert.same(String(params), '=&=');

  params = new URLSearchParams();
  params.append(undefined, undefined);
  assert.same(String(params), 'undefined=undefined');
  params.append(undefined, undefined);
  assert.same(String(params), 'undefined=undefined&undefined=undefined');

  params = new URLSearchParams();
  params.append(null, null);
  assert.same(String(params), 'null=null');
  params.append(null, null);
  assert.same(String(params), 'null=null&null=null');

  params = new URLSearchParams();
  params.append('first', 1);
  params.append('second', 2);
  params.append('third', '');
  params.append('first', 10);
  assert.true(params.has('first'), 'search params object has name "first"');
  assert.same(params.get('first'), '1', 'search params object has name "first" with value "1"');
  assert.same(params.get('second'), '2', 'search params object has name "second" with value "2"');
  assert.same(params.get('third'), '', 'search params object has name "third" with value ""');
  params.append('first', 10);
  assert.same(params.get('first'), '1', 'search params object has name "first" with value "1"');

  assert.throws(() => {
    return new URLSearchParams('').append();
  }, 'throws w/o arguments');
});

QUnit.test('URLSearchParams#delete', assert => {
  const $delete = URLSearchParams.prototype.delete;
  assert.isFunction($delete);
  assert.arity($delete, 1);
  // Deno 1.10 methods are not enumerable.
  if (DENO_VERSION !== 110) assert.enumerable(URLSearchParams.prototype, 'delete');
  // Deno 1.x implements this API in JavaScript without native-looking source strings.
  if (!NODE && !DENO) assert.looksNative($delete);

  let params = new URLSearchParams('a=b&c=d');
  params.delete('a');
  assert.same(String(params), 'c=d');

  params = new URLSearchParams('a=a&b=b&a=a&c=c');
  params.delete('a');
  assert.same(String(params), 'b=b&c=c');

  params = new URLSearchParams('a=a&=&b=b&c=c');
  params.delete('');
  assert.same(String(params), 'a=a&b=b&c=c');

  params = new URLSearchParams('a=a&null=null&b=b');
  params.delete(null);
  assert.same(String(params), 'a=a&b=b');

  params = new URLSearchParams('a=a&undefined=undefined&b=b');
  params.delete(undefined);
  assert.same(String(params), 'a=a&b=b');

  params = new URLSearchParams();
  params.append('first', 1);
  assert.true(params.has('first'), 'search params object has name "first"');
  assert.same(params.get('first'), '1', 'search params object has name "first" with value "1"');
  params.delete('first');
  assert.false(params.has('first'), 'search params object has no "first" name');
  params.append('first', 1);
  params.append('first', 10);
  params.delete('first');
  assert.false(params.has('first'), 'search params object has no "first" name');

  params = new URLSearchParams('a=1&a=2&a=null&a=3&b=4');
  params.delete('a', 2);
  assert.same(String(params), 'a=1&a=null&a=3&b=4');

  params = new URLSearchParams('a=1&a=1&b=2&a=1');
  params.delete('a', '1');
  assert.same(String(params), 'b=2', 'delete with value removes all matching name+value pairs');

  params = new URLSearchParams('a=1&a=2&a=null&a=3&b=4');
  params.delete('a', null);
  assert.same(String(params), 'a=1&a=2&a=3&b=4');

  params = new URLSearchParams('a=1&a=2&a=null&a=3&b=4');
  params.delete('a', undefined);
  assert.same(String(params), 'b=4');

  // delete with value should not drop entries with the same key before the target
  params = new URLSearchParams('b=1&a=2&b=3');
  params.delete('a', '2');
  assert.same(String(params), 'b=1&b=3', 'entries before target with same key preserved');

  params = new URLSearchParams('a=1&a=2&b=3');
  params.delete('a', '1');
  assert.same(String(params), 'a=2&b=3', 'only matching name+value pairs removed, rest preserved');

  params = new URLSearchParams('a=1&b=2');
  params.delete('a', '999');
  assert.same(String(params), 'a=1&b=2', 'no match leaves all entries intact');

  if (DESCRIPTORS) {
    let url = new URL('http://example.com/?param1&param2');
    url.searchParams.delete('param1');
    url.searchParams.delete('param2');
    assert.same(String(url), 'http://example.com/', 'url.href does not have ?');
    assert.same(url.search, '', 'url.search does not have ?');

    url = new URL('http://example.com/?');
    url.searchParams.delete('param1');
    // assert.same(String(url), 'http://example.com/', 'url.href does not have ?'); // Safari bug
    assert.same(url.search, '', 'url.search does not have ?');
  }

  assert.throws(() => {
    return new URLSearchParams('').delete();
  }, 'throws w/o arguments');
});

QUnit.test('URLSearchParams#delete with many duplicates', assert => {
  const params = new URLSearchParams('head=0');
  const afterValue = ['head=0'];
  const afterName = ['head=0'];
  for (let index = 0; index < 128; index++) {
    params.append('a', 'remove');
    params.append('a', 'keep');
    params.append('item', index);
    afterValue.push('a=keep', `item=${ index }`);
    afterName.push(`item=${ index }`);
  }
  params.append('tail', 'end');
  afterValue.push('tail=end');
  afterName.push('tail=end');
  const input = String(params);
  const iterator = params.entries();
  assert.deepEqual(iterator.next().value, ['head', '0']);

  params.delete('a', 'remove');
  assert.same(String(params), afterValue.join('&'), 'delete by value preserves the remaining entries in order');
  assert.same(params.size, 258, 'size after deleting by value');
  assert.deepEqual(iterator.next().value, ['a', 'keep'], 'existing iterator sees deletion by value');

  params.delete('a');
  assert.same(String(params), afterName.join('&'), 'delete by name preserves the remaining entries in order');
  assert.same(params.size, 130, 'size after deleting by name');
  assert.deepEqual(iterator.next().value, ['item', '1'], 'existing iterator keeps its position after deletion by name');

  params.delete('item');
  params.delete('head');
  params.delete('tail');
  assert.same(String(params), '', 'all entries removed');
  assert.same(params.size, 0, 'empty size');

  if (DESCRIPTORS) {
    const url = new URL(`https://example.com/?${ input }`);
    url.searchParams.delete('a', 'remove');
    assert.same(url.search, `?${ afterValue.join('&') }`, 'URL updated after deleting by value');
    url.searchParams.delete('a');
    assert.same(url.search, `?${ afterName.join('&') }`, 'URL updated after deleting by name');
  }
});

QUnit.test('URLSearchParams#get', assert => {
  const { get } = URLSearchParams.prototype;
  assert.isFunction(get);
  assert.arity(get, 1);
  assert.name(get, 'get');
  // Deno 1.10 methods are not enumerable.
  if (DENO_VERSION !== 110) assert.enumerable(URLSearchParams.prototype, 'get');
  // Deno 1.x implements this API in JavaScript without native-looking source strings.
  if (!NODE && !DENO) assert.looksNative(get);

  let params = new URLSearchParams('a=b&c=d');
  assert.same(params.get('a'), 'b');
  assert.same(params.get('c'), 'd');
  assert.same(params.get('e'), null);

  params = new URLSearchParams('a=b&c=d&a=e');
  assert.same(params.get('a'), 'b');

  params = new URLSearchParams('=b&c=d');
  assert.same(params.get(''), 'b');

  params = new URLSearchParams('a=&c=d&a=e');
  assert.same(params.get('a'), '');

  params = new URLSearchParams('first=second&third&&');
  assert.true(params.has('first'), 'Search params object has name "first"');
  assert.same(params.get('first'), 'second', 'Search params object has name "first" with value "second"');
  assert.same(params.get('third'), '', 'Search params object has name "third" with the empty value.');
  assert.same(params.get('fourth'), null, 'Search params object has no "fourth" name and value.');

  assert.same(new URLSearchParams('a=b c').get('a'), 'b c');
  assert.same(new URLSearchParams('a b=c').get('a b'), 'c');

  assert.same(new URLSearchParams('a=b%20c').get('a'), 'b c', 'parse %20');
  assert.same(new URLSearchParams('a%20b=c').get('a b'), 'c', 'parse %20');

  assert.same(new URLSearchParams('a=b\0c').get('a'), 'b\0c', 'parse \\0');
  assert.same(new URLSearchParams('a\0b=c').get('a\0b'), 'c', 'parse \\0');

  assert.same(new URLSearchParams('a=b%2Bc').get('a'), 'b+c', 'parse %2B');
  assert.same(new URLSearchParams('a%2Bb=c').get('a+b'), 'c', 'parse %2B');

  assert.same(new URLSearchParams('a=b%00c').get('a'), 'b\0c', 'parse %00');
  assert.same(new URLSearchParams('a%00b=c').get('a\0b'), 'c', 'parse %00');

  assert.same(new URLSearchParams('a==').get('a'), '=', 'parse =');
  assert.same(new URLSearchParams('a=b=').get('a'), 'b=', 'parse =');
  assert.same(new URLSearchParams('a=b=c').get('a'), 'b=c', 'parse =');
  assert.same(new URLSearchParams('a==b').get('a'), '=b', 'parse =');

  assert.same(new URLSearchParams('a=b\u2384').get('a'), 'b\u2384', 'parse \\u2384');
  assert.same(new URLSearchParams('a\u2384b=c').get('a\u2384b'), 'c', 'parse \\u2384');

  assert.same(new URLSearchParams('a=b%e2%8e%84').get('a'), 'b\u2384', 'parse %e2%8e%84');
  assert.same(new URLSearchParams('a%e2%8e%84b=c').get('a\u2384b'), 'c', 'parse %e2%8e%84');

  assert.same(new URLSearchParams('a=b\uD83D\uDCA9c').get('a'), 'b\uD83D\uDCA9c', 'parse \\uD83D\\uDCA9');
  assert.same(new URLSearchParams('a\uD83D\uDCA9b=c').get('a\uD83D\uDCA9b'), 'c', 'parse \\uD83D\\uDCA9');

  assert.same(new URLSearchParams('a=b%f0%9f%92%a9c').get('a'), 'b\uD83D\uDCA9c', 'parse %f0%9f%92%a9');
  assert.same(new URLSearchParams('a%f0%9f%92%a9b=c').get('a\uD83D\uDCA9b'), 'c', 'parse %f0%9f%92%a9');

  assert.same(new URLSearchParams('=').get(''), '', 'parse =');

  assert.throws(() => {
    return new URLSearchParams('').get();
  }, 'throws w/o arguments');
});

QUnit.test('URLSearchParams#getAll', assert => {
  const { getAll } = URLSearchParams.prototype;
  assert.isFunction(getAll);
  assert.arity(getAll, 1);
  assert.name(getAll, 'getAll');
  // Deno 1.10 methods are not enumerable.
  if (DENO_VERSION !== 110) assert.enumerable(URLSearchParams.prototype, 'getAll');
  // Deno 1.x implements this API in JavaScript without native-looking source strings.
  if (!NODE && !DENO) assert.looksNative(getAll);

  let params = new URLSearchParams('a=b&c=d');
  assert.arrayEqual(params.getAll('a'), ['b']);
  assert.arrayEqual(params.getAll('c'), ['d']);
  assert.arrayEqual(params.getAll('e'), []);

  params = new URLSearchParams('a=b&c=d&a=e');
  assert.arrayEqual(params.getAll('a'), ['b', 'e']);

  params = new URLSearchParams('=b&c=d');
  assert.arrayEqual(params.getAll(''), ['b']);

  params = new URLSearchParams('a=&c=d&a=e');
  assert.arrayEqual(params.getAll('a'), ['', 'e']);

  params = new URLSearchParams('a=1&a=2&a=3&a');
  assert.arrayEqual(params.getAll('a'), ['1', '2', '3', ''], 'search params object has expected name "a" values');
  params.set('a', 'one');
  assert.arrayEqual(params.getAll('a'), ['one'], 'search params object has expected name "a" values');

  assert.throws(() => {
    return new URLSearchParams('').getAll();
  }, 'throws w/o arguments');
});

QUnit.test('URLSearchParams#has', assert => {
  const { has } = URLSearchParams.prototype;
  assert.isFunction(has);
  assert.arity(has, 1);
  assert.name(has, 'has');
  // Deno 1.10 methods are not enumerable.
  if (DENO_VERSION !== 110) assert.enumerable(URLSearchParams.prototype, 'has');
  // Deno 1.x implements this API in JavaScript without native-looking source strings.
  if (!NODE && !DENO) assert.looksNative(has);

  let params = new URLSearchParams('a=b&c=d');
  assert.true(params.has('a'));
  assert.true(params.has('c'));
  assert.false(params.has('e'));

  params = new URLSearchParams('a=b&c=d&a=e');
  assert.true(params.has('a'));

  params = new URLSearchParams('=b&c=d');
  assert.true(params.has(''));

  params = new URLSearchParams('null=a');
  assert.true(params.has(null));

  params = new URLSearchParams('a=b&c=d&&');
  params.append('first', 1);
  params.append('first', 2);
  assert.true(params.has('a'), 'search params object has name "a"');
  assert.true(params.has('c'), 'search params object has name "c"');
  assert.true(params.has('first'), 'search params object has name "first"');
  assert.false(params.has('d'), 'search params object has no name "d"');
  params.delete('first');
  assert.false(params.has('first'), 'search params object has no name "first"');

  params = new URLSearchParams('a=1&a=2&a=null&a=3&b=4');
  assert.true(params.has('a', 2));
  assert.true(params.has('a', null));
  assert.false(params.has('a', 4));
  assert.true(params.has('b', 4));
  assert.false(params.has('b', null));
  assert.true(params.has('b', undefined));
  assert.false(params.has('c', undefined));

  assert.throws(() => {
    return new URLSearchParams('').has();
  }, 'throws w/o arguments');
});

QUnit.test('URLSearchParams#set', assert => {
  const { set } = URLSearchParams.prototype;
  assert.isFunction(set);
  assert.arity(set, 2);
  assert.name(set, 'set');
  // Deno 1.10 methods are not enumerable.
  if (DENO_VERSION !== 110) assert.enumerable(URLSearchParams.prototype, 'set');
  // Deno 1.x implements this API in JavaScript without native-looking source strings.
  if (!NODE && !DENO) assert.looksNative(set);

  let params = new URLSearchParams('a=b&c=d');
  params.set('a', 'B');
  assert.same(String(params), 'a=B&c=d');

  params = new URLSearchParams('a=b&c=d&a=e');
  params.set('a', 'B');
  assert.same(String(params), 'a=B&c=d');
  params.set('e', 'f');
  assert.same(String(params), 'a=B&c=d&e=f');

  params = new URLSearchParams('a=1&a=2&a=3');
  assert.true(params.has('a'), 'search params object has name "a"');
  assert.same(params.get('a'), '1', 'search params object has name "a" with value "1"');
  params.set('first', 4);
  assert.true(params.has('a'), 'search params object has name "a"');
  assert.same(params.get('a'), '1', 'search params object has name "a" with value "1"');
  assert.same(String(params), 'a=1&a=2&a=3&first=4');
  params.set('a', 4);
  assert.true(params.has('a'), 'search params object has name "a"');
  assert.same(params.get('a'), '4', 'search params object has name "a" with value "4"');
  assert.same(String(params), 'a=4&first=4');

  assert.throws(() => new URLSearchParams('').set(), 'throws w/o arguments');

  assert.throws(() => new URLSearchParams('').set('a'), 'throws with only 1 argument');
});

QUnit.test('URLSearchParams#set with many duplicates', assert => {
  const params = new URLSearchParams('head=0');
  const expected = ['head=0', 'a=new'];
  for (let index = 0; index < 128; index++) {
    params.append('a', index);
    params.append('item', index);
    expected.push(`item=${ index }`);
  }
  params.append('tail', 'end');
  expected.push('tail=end');
  const input = String(params);
  const iterator = params.entries();
  assert.deepEqual(iterator.next().value, ['head', '0']);

  params.set('a', 'new');
  assert.same(String(params), expected.join('&'), 'first matching entry keeps its position, later matches are removed');
  assert.same(params.size, 131, 'size after replacing duplicates');
  assert.deepEqual(iterator.next().value, ['a', 'new'], 'existing iterator sees the replacement');

  params.set('missing', 'added');
  assert.same(String(params), `${ expected.join('&') }&missing=added`, 'absent key appended');
  assert.same(params.size, 132, 'size after appending');
  params.set('a', 'updated');
  assert.same(String(params), `${ expected.join('&').replace('a=new', 'a=updated') }&missing=added`, 'single matching entry keeps its position');
  assert.deepEqual(iterator.next().value, ['item', '0'], 'existing iterator sees the remaining entries');

  if (DESCRIPTORS) {
    const url = new URL(`https://example.com/?${ input }`);
    url.searchParams.set('a', 'new');
    assert.same(url.search, `?${ expected.join('&') }`, 'URL updated after replacing duplicates');
    url.searchParams.set('missing', 'added');
    assert.same(url.search, `?${ expected.join('&') }&missing=added`, 'URL updated after appending');
  }
});

QUnit.test('URLSearchParams#sort', assert => {
  const { sort } = URLSearchParams.prototype;
  assert.isFunction(sort);
  assert.arity(sort, 0);
  assert.name(sort, 'sort');
  // Deno 1.10 methods are not enumerable.
  if (DENO_VERSION !== 110) assert.enumerable(URLSearchParams.prototype, 'sort');
  // Deno 1.x implements this API in JavaScript without native-looking source strings.
  if (!NODE && !DENO) assert.looksNative(sort);

  let params = new URLSearchParams('a=1&b=4&a=3&b=2');
  params.sort();
  assert.same(String(params), 'a=1&a=3&b=4&b=2');
  params.delete('a');
  params.append('a', '0');
  params.append('b', '0');
  params.sort();
  assert.same(String(params), 'a=0&b=4&b=2&b=0');

  const testData = [
    {
      input: 'z=b&a=b&z=a&a=a',
      output: [['a', 'b'], ['a', 'a'], ['z', 'b'], ['z', 'a']],
    },
    {
      input: '\uFFFD=x&\uFFFC&\uFFFD=a',
      output: [['\uFFFC', ''], ['\uFFFD', 'x'], ['\uFFFD', 'a']],
    },
    {
      input: 'ﬃ&🌈', // 🌈 > code point, but < code unit because two code units
      output: [['🌈', ''], ['ﬃ', '']],
    },
    {
      input: 'é&e\uFFFD&e\u0301',
      output: [['e\u0301', ''], ['e\uFFFD', ''], ['é', '']],
    },
    {
      input: 'z=z&a=a&z=y&a=b&z=x&a=c&z=w&a=d&z=v&a=e&z=u&a=f&z=t&a=g',
      output: [
        ['a', 'a'],
        ['a', 'b'],
        ['a', 'c'],
        ['a', 'd'],
        ['a', 'e'],
        ['a', 'f'],
        ['a', 'g'],
        ['z', 'z'],
        ['z', 'y'],
        ['z', 'x'],
        ['z', 'w'],
        ['z', 'v'],
        ['z', 'u'],
        ['z', 't'],
      ],
    },
    {
      input: 'bbb&bb&aaa&aa=x&aa=y',
      output: [['aa', 'x'], ['aa', 'y'], ['aaa', ''], ['bb', ''], ['bbb', '']],
    },
    {
      input: 'z=z&=f&=t&=x',
      output: [['', 'f'], ['', 't'], ['', 'x'], ['z', 'z']],
    },
    {
      input: 'a🌈&a💩',
      output: [['a🌈', ''], ['a💩', '']],
    },
  ];

  for (const { input, output } of testData) {
    let i = 0;
    params = new URLSearchParams(input);
    params.sort();
    params.forEach((value, key) => {
      const [reqKey, reqValue] = output[i++];
      assert.same(key, reqKey);
      assert.same(value, reqValue);
    });

    i = 0;
    const url = new URL(`?${ input }`, 'https://example/');
    params = url.searchParams;
    params.sort();
    params.forEach((value, key) => {
      const [reqKey, reqValue] = output[i++];
      assert.same(key, reqKey);
      assert.same(value, reqValue);
    });
  }

  if (DESCRIPTORS) {
    const url = new URL('http://example.com/?');
    url.searchParams.sort();
    assert.same(url.href, 'http://example.com/', 'Sorting non-existent params removes ? from URL');
    assert.same(url.search, '', 'Sorting non-existent params removes ? from URL');
  }
});

QUnit.test('URLSearchParams#toString', assert => {
  const { toString } = URLSearchParams.prototype;
  assert.isFunction(toString);
  assert.arity(toString, 0);
  assert.name(toString, 'toString');
  // Deno 1.x implements this API in JavaScript without native-looking source strings.
  if (!NODE && !DENO) assert.looksNative(toString);

  let params = new URLSearchParams();
  params.append('a', 'b c');
  assert.same(String(params), 'a=b+c');
  params.delete('a');
  params.append('a b', 'c');
  assert.same(String(params), 'a+b=c');

  params = new URLSearchParams();
  params.append('a', '');
  assert.same(String(params), 'a=');
  params.append('a', '');
  assert.same(String(params), 'a=&a=');
  params.append('', 'b');
  assert.same(String(params), 'a=&a=&=b');
  params.append('', '');
  assert.same(String(params), 'a=&a=&=b&=');
  params.append('', '');
  assert.same(String(params), 'a=&a=&=b&=&=');

  params = new URLSearchParams();
  params.append('', 'b');
  assert.same(String(params), '=b');
  params.append('', 'b');
  assert.same(String(params), '=b&=b');

  params = new URLSearchParams();
  params.append('', '');
  assert.same(String(params), '=');
  params.append('', '');
  assert.same(String(params), '=&=');

  params = new URLSearchParams();
  params.append('a', 'b+c');
  assert.same(String(params), 'a=b%2Bc');
  params.delete('a');
  params.append('a+b', 'c');
  assert.same(String(params), 'a%2Bb=c');

  params = new URLSearchParams();
  params.append('=', 'a');
  assert.same(String(params), '%3D=a');
  params.append('b', '=');
  assert.same(String(params), '%3D=a&b=%3D');

  params = new URLSearchParams();
  params.append('&', 'a');
  assert.same(String(params), '%26=a');
  params.append('b', '&');
  assert.same(String(params), '%26=a&b=%26');

  params = new URLSearchParams();
  params.append('a', '\r');
  assert.same(String(params), 'a=%0D');

  params = new URLSearchParams();
  params.append('a', '\n');
  assert.same(String(params), 'a=%0A');

  params = new URLSearchParams();
  params.append('a', '\r\n');
  assert.same(String(params), 'a=%0D%0A');

  params = new URLSearchParams();
  params.append('a', 'b%c');
  assert.same(String(params), 'a=b%25c');
  params.delete('a');
  params.append('a%b', 'c');
  assert.same(String(params), 'a%25b=c');

  params = new URLSearchParams();
  params.append('a', 'b\0c');
  assert.same(String(params), 'a=b%00c');
  params.delete('a');
  params.append('a\0b', 'c');
  assert.same(String(params), 'a%00b=c');

  params = new URLSearchParams();
  params.append('a', 'b\uD83D\uDCA9c');
  assert.same(String(params), 'a=b%F0%9F%92%A9c');
  params.delete('a');
  params.append('a\uD83D\uDCA9b', 'c');
  assert.same(String(params), 'a%F0%9F%92%A9b=c');

  params = new URLSearchParams('a=b&c=d&&e&&');
  assert.same(String(params), 'a=b&c=d&e=');
  params = new URLSearchParams('a = b &a=b&c=d%20');
  assert.same(String(params), 'a+=+b+&a=b&c=d+');
  params = new URLSearchParams('a=&a=b');
  assert.same(String(params), 'a=&a=b');
});

QUnit.test('URLSearchParams#forEach', assert => {
  const { forEach } = URLSearchParams.prototype;
  assert.isFunction(forEach);
  // Deno 1.10 exposes arity 2.
  if (DENO_VERSION !== 110) assert.arity(forEach, 1);
  assert.name(forEach, 'forEach');
  // Deno 1.10 methods are not enumerable.
  if (DENO_VERSION !== 110) assert.enumerable(URLSearchParams.prototype, 'forEach');
  // Deno 1.x implements this API in JavaScript without native-looking source strings.
  if (!NODE && !DENO) assert.looksNative(forEach);

  const expectedValues = { a: '1', b: '2', c: '3' };
  let params = new URLSearchParams('a=1&b=2&c=3');
  let result = '';
  params.forEach((value, key, that) => {
    assert.same(params.get(key), expectedValues[key]);
    assert.same(value, expectedValues[key]);
    assert.same(that, params);
    result += key;
  });
  assert.same(result, 'abc');

  new URL('http://a.b/c').searchParams.forEach(() => {
    assert.avoid();
  });

  // fails in Chrome 66-
  if (DESCRIPTORS) {
    const url = new URL('http://a.b/c?a=1&b=2&c=3&d=4');
    params = url.searchParams;
    result = '';
    params.forEach((val, key) => {
      url.search = 'x=1&y=2&z=3';
      result += key + val;
    });
    assert.same(result, 'a1y2z3');
  }

  // fails in Chrome 66-
  params = new URLSearchParams('a=1&b=2&c=3');
  result = '';
  params.forEach((value, key) => {
    params.delete('b');
    result += key + value;
  });
  assert.same(result, 'a1c3');
});

QUnit.test('URLSearchParams#entries', assert => {
  const { entries } = URLSearchParams.prototype;
  assert.isFunction(entries);
  assert.arity(entries, 0);
  assert.name(entries, 'entries');
  // Deno 1.10 methods are not enumerable.
  if (DENO_VERSION !== 110) assert.enumerable(URLSearchParams.prototype, 'entries');
  // Deno 1.x implements this API in JavaScript without native-looking source strings.
  if (!NODE && !DENO) assert.looksNative(entries);

  const expectedValues = { a: '1', b: '2', c: '3' };
  let params = new URLSearchParams('a=1&b=2&c=3');
  let iterator = params.entries();
  let result = '';
  let entry;
  while (!(entry = iterator.next()).done) {
    const [key, value] = entry.value;
    assert.same(params.get(key), expectedValues[key]);
    assert.same(value, expectedValues[key]);
    result += key;
  }
  assert.same(result, 'abc');

  assert.true(new URL('http://a.b/c').searchParams.entries().next().done, 'should be finished');

  // fails in Chrome 66-
  if (DESCRIPTORS) {
    const url = new URL('http://a.b/c?a=1&b=2&c=3&d=4');
    iterator = url.searchParams.entries();
    result = '';
    while (!(entry = iterator.next()).done) {
      const [key, value] = entry.value;
      url.search = 'x=1&y=2&z=3';
      result += key + value;
    }
    assert.same(result, 'a1y2z3');
  }

  // fails in Chrome 66-
  params = new URLSearchParams('a=1&b=2&c=3');
  iterator = params.entries();
  result = '';
  while (!(entry = iterator.next()).done) {
    params.delete('b');
    const [key, value] = entry.value;
    result += key + value;
  }
  assert.same(result, 'a1c3');

  // Deno 1.10 keeps next on an ancestor of the iterator prototype.
  if (DESCRIPTORS && DENO_VERSION !== 110) assert.true(getOwnPropertyDescriptor(getPrototypeOf(new URLSearchParams().entries()), 'next').enumerable, 'enumerable .next');
});

QUnit.test('URLSearchParams#keys', assert => {
  const { keys } = URLSearchParams.prototype;
  assert.isFunction(keys);
  assert.arity(keys, 0);
  assert.name(keys, 'keys');
  // Deno 1.10 methods are not enumerable.
  if (DENO_VERSION !== 110) assert.enumerable(URLSearchParams.prototype, 'keys');
  // Deno 1.x implements this API in JavaScript without native-looking source strings.
  if (!NODE && !DENO) assert.looksNative(keys);

  let iterator = new URLSearchParams('a=1&b=2&c=3').keys();
  let result = '';
  let entry;
  while (!(entry = iterator.next()).done) {
    result += entry.value;
  }
  assert.same(result, 'abc');

  assert.true(new URL('http://a.b/c').searchParams.keys().next().done, 'should be finished');

  // fails in Chrome 66-
  if (DESCRIPTORS) {
    const url = new URL('http://a.b/c?a=1&b=2&c=3&d=4');
    iterator = url.searchParams.keys();
    result = '';
    while (!(entry = iterator.next()).done) {
      const key = entry.value;
      url.search = 'x=1&y=2&z=3';
      result += key;
    }
    assert.same(result, 'ayz');
  }

  // fails in Chrome 66-
  const params = new URLSearchParams('a=1&b=2&c=3');
  iterator = params.keys();
  result = '';
  while (!(entry = iterator.next()).done) {
    params.delete('b');
    const key = entry.value;
    result += key;
  }
  assert.same(result, 'ac');

  // Deno 1.10 keeps next on an ancestor of the iterator prototype.
  if (DESCRIPTORS && DENO_VERSION !== 110) assert.true(getOwnPropertyDescriptor(getPrototypeOf(new URLSearchParams().keys()), 'next').enumerable, 'enumerable .next');
});

QUnit.test('URLSearchParams#values', assert => {
  const { values } = URLSearchParams.prototype;
  assert.isFunction(values);
  assert.arity(values, 0);
  assert.name(values, 'values');
  // Deno 1.10 methods are not enumerable.
  if (DENO_VERSION !== 110) assert.enumerable(URLSearchParams.prototype, 'values');
  // Deno 1.x implements this API in JavaScript without native-looking source strings.
  if (!NODE && !DENO) assert.looksNative(values);

  let iterator = new URLSearchParams('a=1&b=2&c=3').values();
  let result = '';
  let entry;
  while (!(entry = iterator.next()).done) {
    result += entry.value;
  }
  assert.same(result, '123');

  assert.true(new URL('http://a.b/c').searchParams.values().next().done, 'should be finished');

  // fails in Chrome 66-
  if (DESCRIPTORS) {
    const url = new URL('http://a.b/c?a=a&b=b&c=c&d=d');
    iterator = url.searchParams.values();
    result = '';
    while (!(entry = iterator.next()).done) {
      const { value } = entry;
      url.search = 'x=x&y=y&z=z';
      result += value;
    }
    assert.same(result, 'ayz');
  }

  // fails in Chrome 66-
  const params = new URLSearchParams('a=1&b=2&c=3');
  iterator = params.values();
  result = '';
  while (!(entry = iterator.next()).done) {
    params.delete('b');
    const key = entry.value;
    result += key;
  }
  assert.same(result, '13');

  // Deno 1.10 keeps next on an ancestor of the iterator prototype.
  if (DESCRIPTORS && DENO_VERSION !== 110) assert.true(getOwnPropertyDescriptor(getPrototypeOf(new URLSearchParams().values()), 'next').enumerable, 'enumerable .next');
});

QUnit.test('URLSearchParams#@@iterator', assert => {
  const entries = URLSearchParams.prototype[Symbol.iterator];
  assert.isFunction(entries);
  assert.arity(entries, 0);
  // Deno 1.10 has a distinct unnamed @@iterator method.
  if (DENO_VERSION !== 110) assert.name(entries, 'entries');
  // Deno 1.x implements this API in JavaScript without native-looking source strings.
  if (!NODE && !DENO) assert.looksNative(entries);

  // Deno 1.10 @@iterator is distinct from entries.
  if (DENO_VERSION !== 110) assert.same(entries, URLSearchParams.prototype.entries);

  const expectedValues = { a: '1', b: '2', c: '3' };
  let params = new URLSearchParams('a=1&b=2&c=3');
  let iterator = params[Symbol.iterator]();
  let result = '';
  let entry;
  while (!(entry = iterator.next()).done) {
    const [key, value] = entry.value;
    assert.same(params.get(key), expectedValues[key]);
    assert.same(value, expectedValues[key]);
    result += key;
  }
  assert.same(result, 'abc');

  assert.true(new URL('http://a.b/c').searchParams[Symbol.iterator]().next().done, 'should be finished');

  // fails in Chrome 66-
  if (DESCRIPTORS) {
    const url = new URL('http://a.b/c?a=1&b=2&c=3&d=4');
    iterator = url.searchParams[Symbol.iterator]();
    result = '';
    while (!(entry = iterator.next()).done) {
      const [key, value] = entry.value;
      url.search = 'x=1&y=2&z=3';
      result += key + value;
    }
    assert.same(result, 'a1y2z3');
  }

  // fails in Chrome 66-
  params = new URLSearchParams('a=1&b=2&c=3');
  iterator = params[Symbol.iterator]();
  result = '';
  while (!(entry = iterator.next()).done) {
    params.delete('b');
    const [key, value] = entry.value;
    result += key + value;
  }
  assert.same(result, 'a1c3');

  // Deno 1.10 keeps next on an ancestor of the iterator prototype.
  if (DESCRIPTORS && DENO_VERSION !== 110) assert.true(getOwnPropertyDescriptor(getPrototypeOf(new URLSearchParams()[Symbol.iterator]()), 'next').enumerable, 'enumerable .next');
});

// Safari 14.1 / 17.6 / 26.6.2 and Bun 0.1.1 / 1.0.31 / 1.4.4 keep exhausted iterators done.
// Bun: https://github.com/oven-sh/bun/issues/48347
// Related WebKit behavior: https://bugs.webkit.org/show_bug.cgi?id=157453
// Deno 1.2-1.11.1; fixed in 1.11.2: https://github.com/denoland/deno/pull/11005
QUnit.skip('URLSearchParams iterators after exhaustion', assert => {
  for (const method of ['keys', 'values', 'entries', Symbol.iterator]) {
    const params = new URLSearchParams();
    const iterator = params[method]();
    const name = String(method);
    const done = { value: undefined, done: true };
    const result = (key, value) => ({ value: method === 'keys' ? key : method === 'values' ? value : [key, value], done: false });

    assert.deepEqual(iterator.next(), done, `${ name }: empty`);
    assert.deepEqual(iterator.next(), done, `${ name }: empty, repeated`);
    params.append('a', '1');
    assert.deepEqual(iterator.next(), result('a', '1'), `${ name }: append to empty`);
    assert.deepEqual(iterator.next(), done, `${ name }: exhausted`);
    assert.deepEqual(iterator.next(), done, `${ name }: exhausted, repeated`);
    params.append('b', '2');
    assert.deepEqual(iterator.next(), result('b', '2'), `${ name }: append after exhaustion`);
    assert.deepEqual(iterator.next(), done, `${ name }: exhausted again`);
  }
});

// Safari 14.1 / 17.6 / 26.6.2 and Bun 0.1.1 / 1.0.31 / 1.4.4 keep exhausted iterators done.
// Bun: https://github.com/oven-sh/bun/issues/48347
// Related WebKit behavior: https://bugs.webkit.org/show_bug.cgi?id=157453
// Deno 1.2-1.11.1; fixed in 1.11.2: https://github.com/denoland/deno/pull/11005
if (DESCRIPTORS) QUnit.skip('URLSearchParams iterators after exhaustion and query replacement', assert => {
  for (const method of ['keys', 'values', 'entries', Symbol.iterator]) {
    const url = new URL('https://example.com/?a=1');
    const iterator = url.searchParams[method]();
    const name = String(method);
    const done = { value: undefined, done: true };
    const result = (key, value) => ({ value: method === 'keys' ? key : method === 'values' ? value : [key, value], done: false });

    assert.deepEqual(iterator.next(), result('a', '1'), `${ name }: first entry`);
    assert.deepEqual(iterator.next(), done, `${ name }: exhausted`);
    assert.deepEqual(iterator.next(), done, `${ name }: exhausted, repeated`);
    url.search = 'x=3&b=2';
    assert.deepEqual(iterator.next(), result('b', '2'), `${ name }: replaced search`);
    url.search = '';
    assert.deepEqual(iterator.next(), done, `${ name }: shortened search`);
    url.search = 'x=3&y=4&c=5';
    assert.deepEqual(iterator.next(), result('c', '5'), `${ name }: regrown search`);
    assert.deepEqual(iterator.next(), done, `${ name }: exhausted again`);
    url.href = 'https://example.org/?x=3&y=4&c=5&d=6';
    assert.deepEqual(iterator.next(), result('d', '6'), `${ name }: replaced href`);
  }
});

QUnit.test('URLSearchParams#size', assert => {
  const params = new URLSearchParams('a=1&b=2&b=3');
  assert.true('size' in params);
  assert.same(params.size, 3);

  if (DESCRIPTORS) {
    assert.true('size' in URLSearchParams.prototype);

    const { enumerable, configurable, get } = getOwnPropertyDescriptor(URLSearchParams.prototype, 'size');

    assert.true(enumerable, 'enumerable');
    // https://github.com/oven-sh/bun/issues/9251
    if (!BUN) assert.true(configurable, 'configurable');

    // Deno 1.x implements this API in JavaScript without native-looking source strings.
    if (!NODE && !DENO) assert.looksNative(get);

    assert.throws(() => get.call([]));
  }
});

QUnit.test('URLSearchParams#size of URL#searchParams', assert => {
  const url = new URL('https://example.com/?a=1&a=2&b=3');
  const params = url.searchParams;
  assert.same(params.size, 3, 'initial URL-bound size');

  params.append('c', 4);
  assert.same(params.size, 4, 'size after append');
  params.append('a', 5);
  assert.same(params.size, 5, 'size after appending a duplicate name');
  params.sort();
  assert.same(params.size, 5, 'sort preserves size');
  params.delete('a', '2');
  assert.same(params.size, 4, 'size after deleting by value');
  params.set('a', 'new');
  assert.same(params.size, 3, 'size after replacing duplicates');
  params.set('d', 6);
  assert.same(params.size, 4, 'size after setting an absent name');
  params.delete('a');
  assert.same(params.size, 3, 'size after deleting by name');
  params.delete('missing');
  assert.same(params.size, 3, 'deleting an absent name preserves size');
  params.delete('b');
  params.delete('c');
  params.delete('d');
  assert.same(params.size, 0, 'size after deleting all entries');
  params.append('a', 1);
  assert.same(params.size, 1, 'size after appending to an emptied list');

  assert.same(new URL('https://example.com/').searchParams.size, 0, 'empty URL-bound size');

  // Deno 1.2-1.7.5 replaces the searchParams object when search or href changes.
  // Fixed in 1.8.0: https://github.com/denoland/deno/pull/9276
  // Regression tests: https://github.com/denoland/deno/pull/9639
  if (DESCRIPTORS && !(DENO_VERSION >= 102 && DENO_VERSION < 108)) {
    url.search = '?x=1&y=2&z=3';
    assert.same(params.size, 3, 'size after replacing search');
    params.append('w', 4);
    assert.same(params.size, 4, 'size after append following search replacement');
    url.href = 'https://example.org/?x=1&x=2&x=3';
    assert.same(params.size, 3, 'size after replacing href');
    url.search = '';
    assert.same(params.size, 0, 'size after clearing search');
  }
});

// Deno 1.10 uses the Object tag for URLSearchParams.
QUnit[DENO_VERSION === 110 ? 'skip' : 'test']('URLSearchParams#@@toStringTag', assert => {
  const params = new URLSearchParams('a=b');
  assert.same({}.toString.call(params), '[object URLSearchParams]');
});

if (typeof Request == 'function') {
  QUnit.test('URLSearchParams with Request', assert => {
    const async = assert.async();
    new Request('http://zloirock.ru', { body: new URLSearchParams({ foo: 'baz' }), method: 'POST' }).text().then(text => {
      assert.same(text, 'foo=baz');
      async();
    });
  });
}
