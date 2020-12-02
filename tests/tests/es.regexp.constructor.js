/* eslint-disable regexp/order-in-character-class, regexp/no-dupe-characters-character-class -- required for testing */
/* eslint-disable regexp/no-useless-character-class, regexp/no-useless-flag, regexp/sort-flags -- required for testing */
import { GLOBAL } from '../helpers/constants';
import { nativeSubclass } from '../helpers/helpers';

QUnit.test('RegExp constructor', assert => {
  const Symbol = GLOBAL.Symbol || {};
  assert.isFunction(RegExp);
  assert.arity(RegExp, 2);
  assert.name(RegExp, 'RegExp');
  assert.looksNative(RegExp);
  assert.ok({}.toString.call(RegExp()).slice(8, -1), 'RegExp');
  assert.ok({}.toString.call(new RegExp()).slice(8, -1), 'RegExp');
  let regexp = /a/g;
  assert.notStrictEqual(regexp, new RegExp(regexp), 'new RegExp(regexp) isnt regexp');
  assert.strictEqual(regexp, RegExp(regexp), 'RegExp(regexp) is regexp');
  regexp[Symbol.match] = false;
  assert.notStrictEqual(regexp, RegExp(regexp), 'RegExp(regexp) isnt regexp, changed Symbol.match');
  const object = {};
  assert.notStrictEqual(object, RegExp(object), 'RegExp(O) isnt O');
  object[Symbol.match] = true;
  object.constructor = RegExp;
  assert.strictEqual(object, RegExp(object), 'RegExp(O) is O, changed Symbol.match');
  assert.strictEqual(String(regexp), '/a/g', 'b is /a/g');
  assert.strictEqual(String(new RegExp(/a/g, 'mi')), '/a/im', 'Allows a regex with flags');
  assert.ok(new RegExp(/a/g, 'im') instanceof RegExp, 'Works with instanceof');
  assert.strictEqual(new RegExp(/a/g, 'im').constructor, RegExp, 'Has the right constructor');

  const orig = /^https?:\/\//i;
  regexp = new RegExp(orig);
  assert.ok(regexp !== orig, 'new + re + no flags #1');
  assert.same(String(regexp), '/^https?:\\/\\//i', 'new + re + no flags #2');
  let result = regexp.exec('http://github.com');
  assert.deepEqual(result, ['http://'], 'new + re + no flags #3');

  /(b)(c)(d)(e)(f)(g)(h)(i)(j)(k)(l)(m)(n)(o)(p)/.exec('abcdefghijklmnopq');
  result = true;
  const characters = 'bcdefghij';
  for (let i = 0, { length } = characters; i < length; ++i) {
    const chr = characters[i];
    if (RegExp[`$${ i + 1 }`] !== chr) {
      result = false;
    }
  }
  assert.ok(result, 'Updates RegExp globals');
  if (nativeSubclass) {
    const Subclass = nativeSubclass(RegExp);
    assert.ok(new Subclass() instanceof Subclass, 'correct subclassing with native classes #1');
    assert.ok(new Subclass() instanceof RegExp, 'correct subclassing with native classes #2');
    assert.ok(new Subclass('^abc$').test('abc'), 'correct subclassing with native classes #3');
  }

  assert.throws(() => RegExp(Symbol(1)), 'throws on symbol argument');
});

QUnit.test('RegExp dotAll', assert => {
  assert.same(RegExp('.', '').test('\n'), false, 'dotAll missed');
  assert.same(RegExp('.', 's').test('\n'), true, 'dotAll basic');
  assert.same(RegExp('[.]', 's').test('\n'), false, 'dotAll brackets #1');
  assert.same(RegExp('[.].', '').test('.\n'), false, 'dotAll brackets #2');
  assert.same(RegExp('[.].', 's').test('.\n'), true, 'dotAll brackets #3');
  assert.same(RegExp('[[].', 's').test('[\n'), true, 'dotAll brackets #4');
  assert.same(RegExp('.[.[].\\..', 's').source, '.[.[].\\..', 'dotAll correct source');

  const string = '123\n456789\n012';
  const re = RegExp('(\\d{3}).\\d{3}', 'sy');

  let match = re.exec(string);
  assert.same(match[1], '123', 's with y #1');
  assert.same(re.lastIndex, 7, 's with y #2');

  match = re.exec(string);
  assert.same(match[1], '789', 's with y #3');
  assert.same(re.lastIndex, 14, 's with y #4');
});

QUnit.test('RegExp NCG', assert => {
  assert.same(RegExp('(?<a>b)').exec('b').groups?.a, 'b', 'NCG #1');
  // eslint-disable-next-line regexp/no-unused-capturing-group -- required for testing
  assert.same(RegExp('(b)').exec('b').groups, undefined, 'NCG #2');
  const { groups } = RegExp('foo:(?<foo>\\w+),bar:(?<bar>\\w+)').exec('foo:abc,bar:def');
  assert.deepEqual(groups, { foo: 'abc', bar: 'def' }, 'NCG #3');
  // fails in Safari
  // assert.same(Object.getPrototypeOf(groups), null, 'NCG #4');
  assert.same('foo:abc,bar:def'.replace(RegExp('foo:(?<foo>\\w+),bar:(?<bar>\\w+)'), '$<bar>,$<foo>'), 'def,abc', 'replace #1');
  assert.same('foo:abc,bar:def'.replace(RegExp('foo:(?<foo>\\w+),bar:(?<bar>\\w+)'), (...args) => {
    const { foo, bar } = args.pop();
    return `${ bar },${ foo }`;
  }), 'def,abc', 'replace #2');
  assert.same('12345'.replaceAll(RegExp('(?<d>[2-4])', 'g'), '$<d>$<d>'), '12233445', 'replaceAll');
  // eslint-disable-next-line no-invalid-regexp -- required for testing
  assert.throws(() => RegExp('(?<1a>b)'), SyntaxError, 'incorrect group name #1');
  // eslint-disable-next-line no-invalid-regexp -- required for testing
  assert.throws(() => RegExp('(?<a#>b)'), SyntaxError, 'incorrect group name #2');
  // eslint-disable-next-line no-invalid-regexp -- required for testing
  assert.throws(() => RegExp('(?< a >b)'), SyntaxError, 'incorrect group name #3');
});
