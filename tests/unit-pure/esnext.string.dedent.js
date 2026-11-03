import defineProperties from 'core-js-pure/es/object/define-properties';
import isFrozen from 'core-js-pure/es/object/is-frozen';
import { DESCRIPTORS, FREEZING, GLOBAL } from '../helpers/constants.js';
import Symbol from 'core-js-pure/es/symbol';
import cooked from 'core-js-pure/full/string/cooked';
import dedent from 'core-js-pure/full/string/dedent';
import freeze from 'core-js-pure/es/object/freeze';

QUnit.test('String.dedent', assert => {
  assert.isFunction(dedent);
  assert.arity(dedent, 1);
  assert.name(dedent, 'dedent');

  assert.same(dedent`
    qwe
    asd
    zxc
  `, 'qwe\nasd\nzxc', '#1');

  assert.same(dedent`
     qwe
    asd
     zxc
  `, ' qwe\nasd\n zxc', '#2');

  assert.same(dedent`
    qwe
    asd
   ${ ' zxc' }
  `, ' qwe\n asd\n zxc', '#3');

  assert.same(dedent({ raw: freeze(['\n  qwe\n  ']) }), 'qwe', '#4');
  assert.same(dedent({ raw: freeze(['\n  qwe', '\n   ']) }, 1), 'qwe1', '#5');

  assert.same(dedent(cooked)`
     qwe
    asd
     zxc
  `, ' qwe\nasd\n zxc', '#6');

  const tag = (it => it)`
    abc
  `;

  const wrapped = dedent(template => template);
  assert.same(wrapped(tag), wrapped(tag), '#7');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => dedent({ raw: freeze(['\n', Symbol('dedent test'), '\n']) }), TypeError, 'throws on symbol');
  }

  assert.throws(() => dedent([]), TypeError, '[]');
  assert.throws(() => dedent(['qwe']), TypeError, '[qwe]');
  assert.throws(() => dedent({ raw: freeze([]) }), TypeError, 'empty tpl');
  assert.throws(() => dedent({ raw: freeze(['qwe']) }), TypeError, 'wrong start');
  assert.throws(() => dedent({ raw: freeze(['\n', 'qwe']) }), TypeError, 'wrong start');
  assert.throws(() => dedent({ raw: freeze(['\n  qwe', 5, '\n   ']) }, 1, 2), TypeError, 'wrong part');
  assert.throws(() => dedent([undefined]), TypeError);
  assert.throws(() => dedent(null), TypeError);

  // \u{} (empty braces) should be an invalid escape, causing TypeError
  assert.same(dedent({ raw: freeze(['\n  \\u{41}\n  ']) }), 'A', 'valid unicode brace escape in raw');
  assert.throws(() => dedent({ raw: freeze(['\n  \\u{}\n  ']) }), TypeError, '\\u{} is an invalid escape');

  // hex/unicode escapes at end of string segment
  assert.same(dedent({ raw: freeze(['\n  \\x41\n  ']) }), 'A', 'hex escape at end of raw string');
  assert.same(dedent({ raw: freeze(['\n  \\u0041\n  ']) }), 'A', 'unicode escape at end of raw string');
});

QUnit.test('String.dedent, template identity', assert => {
  const tag = dedent(template => template);
  const raw = freeze(['\n  a\n']);
  const result = tag({ raw });
  assert.same(tag({ raw }), result, 'same raw object shares the cached template');
  assert.same(dedent(template => template)({ raw }), result, 'different wrappers share the cache');
  assert.notSame(tag({ raw: freeze(['\n  a\n']) }), result, 'equal raw strings with a different identity');
  assert.arrayEqual(result, ['a']);
  assert.arrayEqual(result.raw, ['a']);
  if (FREEZING) {
    assert.true(isFrozen(result), 'cooked array is frozen');
    assert.true(isFrozen(result.raw), 'raw array is frozen');
  }
  if (DESCRIPTORS) {
    assert.nonEnumerable(result, 'raw');
    assert.nonWritable(result, 'raw');
    assert.nonConfigurable(result, 'raw');
  }
});

QUnit.test('String.dedent, captured RegExp methods', assert => {
  const { prototype } = GLOBAL.RegExp;
  for (const key of ['exec', Symbol.split]) {
    if (key === undefined || !(key in prototype)) continue;
    const original = prototype[key];
    const raw = freeze(['\n  a\r\n  b\n']);
    let result;
    try {
      prototype[key] = () => { throw new Error('Replaced RegExp method'); };
      result = dedent({ raw });
    } finally {
      prototype[key] = original;
    }
    assert.same(result, 'a\nb');
  }
});

QUnit.test('String.dedent, line terminators', assert => {
  const tag = dedent(template => template);
  for (const newline of ['\n', '\r', '\r\n', '\u2028', '\u2029']) {
    const raw = freeze([`${ newline }  a${ newline }  b${ newline }  `]);
    const result = tag({ raw });
    const cookedNewline = newline === '\r' || newline === '\r\n' ? '\n' : newline;
    assert.same(result[0], `a${ cookedNewline }b`, 'cooked line terminator');
    assert.same(result.raw[0], `a${ newline }b`, 'raw line terminator is preserved');
    assert.same(dedent({ raw }), `a${ cookedNewline }b`, 'direct call');
  }
  const raw = freeze(['\r\n  a\r\n   \r\n  b\r\n  ']);
  assert.same(dedent({ raw }), 'a\n\nb', 'whitespace-only line');
  assert.same(tag({ raw }).raw[0], 'a\r\n\r\nb', 'raw whitespace-only line');
  assert.same(dedent({ raw: freeze(['\n']) }), '', 'opening and closing line without content');
});

QUnit.test('String.dedent, cooking escapes', assert => {
  const tag = dedent(template => template);
  const cases = [
    ['a\\rb', 'a\rb'],
    ['a\\vb', 'a\u000Bb'],
    ['a\\\rb', 'ab'],
    ['a\\\r\nb', 'ab'],
    ['a\\\nb', 'ab'],
    ['a\\\u2028b', 'ab'],
    ['a\\\u2029b', 'ab'],
    ['a\\\\\rb', 'a\\\nb'],
    ['\\x41\\u0042\\u{43}', 'ABC'],
    ['` ${', '` ${'],
  ];
  for (const [source, expected] of cases) {
    const raw = freeze([`\n${ source }\n`]);
    const result = tag({ raw });
    assert.same(result[0], expected, 'cooked escape');
    assert.same(result.raw[0], source, 'raw escape is preserved');
    assert.same(dedent({ raw }), expected, 'direct call');
  }
  for (const source of ['\\', '\\01', '\\8', '\\x4', '\\u004', '\\u{}', '\\u{110000}']) {
    const raw = freeze([`\n${ source }\n`]);
    assert.same(tag({ raw })[0], undefined, 'invalid escape cooks to undefined');
    assert.throws(() => dedent({ raw }), TypeError, 'direct call rejects an invalid escape');
  }
});

QUnit.test('String.dedent, raw validation', assert => {
  const tag = dedent(template => template);
  for (const raw of [undefined, null, false, true, 0, 1, '', '\n']) {
    assert.throws(() => dedent({ raw }), TypeError, 'raw must be an object');
    assert.throws(() => tag({ raw }), TypeError, 'wrapped tag validates raw');
  }
  assert.same(dedent({ raw: freeze({ 0: '\n  a\n', length: 1 }) }), 'a', 'frozen array-like object');
});

QUnit.test('String.dedent, large raw length', assert => {
  for (const length of [0x100000000, 0x1FFFFFFFFFFFFF, Infinity]) {
    assert.throws(() => dedent({ raw: freeze({ length }) }), TypeError, 'invalid first element');
  }
  if (DESCRIPTORS) {
    const error = new Error('first element');
    let lengthCalls = 0;
    const raw = freeze(defineProperties({}, {
      length: {
        get() {
          lengthCalls++;
          return 0x100000000;
        },
      },
      0: { get() { throw error; } },
    }));
    assert.throws(() => dedent({ raw }), exception => exception === error, 'read first element before allocating the output');
    assert.same(lengthCalls, 1, 'length is read once');
  }
});
