/* eslint-disable regexp/sort-flags, regexp/no-useless-flag -- required for testing */
import { DESCRIPTORS, GLOBAL, STRICT } from '../helpers/constants.js';

QUnit.test('RegExp#toString', assert => {
  const { toString } = RegExp.prototype;
  assert.isFunction(toString);
  assert.arity(toString, 0);
  assert.name(toString, 'toString');
  assert.looksNative(toString);
  assert.nonEnumerable(RegExp.prototype, 'toString');
  assert.same(String(/pattern/), '/pattern/');
  assert.same(String(/pattern/i), '/pattern/i');
  assert.same(String(/pattern/mi), '/pattern/im');
  assert.same(String(/pattern/im), '/pattern/im');
  assert.same(String(/pattern/mgi), '/pattern/gim');
  assert.same(String(new RegExp('pattern')), '/pattern/');
  assert.same(String(new RegExp('pattern', 'i')), '/pattern/i');
  assert.same(String(new RegExp('pattern', 'mi')), '/pattern/im');
  assert.same(String(new RegExp('pattern', 'im')), '/pattern/im');
  assert.same(String(new RegExp('pattern', 'mgi')), '/pattern/gim');
  assert.same(toString.call({
    source: 'foo',
    flags: 'bar',
  }), '/foo/bar');
  assert.same(toString.call({}), '/undefined/undefined');
  if (STRICT) {
    assert.throws(() => toString.call(7));
    assert.throws(() => toString.call('a'));
    assert.throws(() => toString.call(false));
    assert.throws(() => toString.call(null));
    assert.throws(() => toString.call(undefined));
  }

  assert.throws(() => toString.call({
    source: Symbol('RegExp#toString test'),
    flags: 'g',
  }), 'throws on symbol');
});

if (DESCRIPTORS) QUnit.test('RegExp#toString with named groups', assert => {
  const cases = [
    ['(?<part>/)[/a]\n\r\u2028\u2029', '/(?<part>\\/)[/a]\\n\\r\\u2028\\u2029/g'],
    ['(?<part>\\\\/\\\n)', '/(?<part>\\\\\\/\\n)/g'],
  ];
  for (const [pattern, expected] of cases) {
    // A slash inside a character class may also be escaped.
    assert.same(String(RegExp(pattern, 'g')).replace('[\\/a]', '[/a]'), expected);
  }
  if ('$1' in RegExp) {
    const re = RegExp('(?<part>a/b)');
    /(marker)/.exec('marker');
    const text = String(re);
    // eslint-disable-next-line regexp/no-legacy-features -- observe the native last capture
    const capture = RegExp.$1;
    assert.same(text, '/(?<part>a\\/b)/');
    assert.same(capture, 'marker', 'reading the source preserves the last capture');
  }
});

QUnit.test('RegExp#toString escapes line terminators', assert => {
  const pattern = '\\\n\\\r\\\u2028\\\u2029';
  const expected = '/\\n\\r\\u2028\\u2029/g';
  assert.same(String(GLOBAL.RegExp('a/b\n')), '/a\\/b\\n/');
  assert.same(String(GLOBAL.RegExp(pattern, 'g')), expected);
  assert.same(RegExp.prototype.toString.call({ source: pattern, flags: 'g' }), `/${ pattern }/g`);
  if (DESCRIPTORS) {
    const inherited = Object.create(RegExp.prototype, { source: { value: pattern }, flags: { value: 'g' } });
    assert.same(RegExp.prototype.toString.call(inherited), `/${ pattern }/g`, 'an inherited prototype does not supply a matcher');
  }

  // A native matcher can have a read-only source and no core-js state.
  // eslint-disable-next-line es/no-regexp-prototype-compile -- initialize a native matcher
  const { compile } = RegExp.prototype;
  if (compile) {
    const re = /a/g;
    compile.call(re, pattern, 'g');
    re.lastIndex = 2;
    assert.same(String(re), expected);
    assert.same(re.lastIndex, 2);
  }
});
