/* eslint-disable prefer-regex-literals, regexp/no-invalid-regexp, regexp/sort-flags -- required for testing */
/* eslint-disable regexp/no-useless-assertions, regexp/no-useless-character-class, regexp/no-useless-flag -- required for testing */
import { DESCRIPTORS, GLOBAL } from '../helpers/constants.js';
import { nativeSubclass } from '../helpers/helpers.js';

const { getPrototypeOf } = Object;

if (DESCRIPTORS) {
  QUnit.test('RegExp constructor', assert => {
    const Symbol = GLOBAL.Symbol || {};
    assert.isFunction(RegExp);
    assert.arity(RegExp, 2);
    assert.name(RegExp, 'RegExp');
    assert.looksNative(RegExp);
    assert.same({}.toString.call(RegExp()).slice(8, -1), 'RegExp');
    assert.same({}.toString.call(new RegExp()).slice(8, -1), 'RegExp');
    let regexp = /a/g;
    assert.notSame(regexp, new RegExp(regexp), 'new RegExp(regexp) is not regexp');
    assert.same(regexp, RegExp(regexp), 'RegExp(regexp) is regexp');
    regexp[Symbol.match] = false;
    assert.notSame(regexp, RegExp(regexp), 'RegExp(regexp) is not regexp, changed Symbol.match');
    const object = {};
    assert.notSame(object, RegExp(object), 'RegExp(O) is not O');
    object[Symbol.match] = true;
    object.constructor = RegExp;
    assert.same(object, RegExp(object), 'RegExp(O) is O, changed Symbol.match');
    assert.same(String(regexp), '/a/g', 'b is /a/g');
    assert.same(String(new RegExp(/a/g, 'mi')), '/a/im', 'Allows a regex with flags');
    assert.true(new RegExp(/a/g, 'im') instanceof RegExp, 'Works with instanceof');
    assert.same(new RegExp(/a/g, 'im').constructor, RegExp, 'Has the right constructor');

    const orig = /^https?:\/\//i;
    regexp = new RegExp(orig);
    assert.notSame(regexp, orig, 'new + re + no flags #1');
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
    assert.true(result, 'Updates RegExp globals');
    if (nativeSubclass) {
      const Subclass = nativeSubclass(RegExp);
      assert.true(new Subclass() instanceof Subclass, 'correct subclassing with native classes #1');
      assert.true(new Subclass() instanceof RegExp, 'correct subclassing with native classes #2');
      assert.true(new Subclass('^abc$').test('abc'), 'correct subclassing with native classes #3');
    }

    assert.throws(() => RegExp(Symbol(1)), 'throws on symbol argument');
  });

  QUnit.test('RegExp dotAll', assert => {
    assert.false(RegExp('.', '').test('\n'), 'dotAll missed');
    assert.true(RegExp('.', 's').test('\n'), 'dotAll basic');
    assert.false(RegExp('[.]', 's').test('\n'), 'dotAll brackets #1');
    assert.false(RegExp('[.].', '').test('.\n'), 'dotAll brackets #2');
    assert.true(RegExp('[.].', 's').test('.\n'), 'dotAll brackets #3');
    assert.true(RegExp('[[].', 's').test('[\n'), 'dotAll brackets #4');
    assert.same(RegExp('.[.[].\\..', 's').source, '.[.[].\\..', 'dotAll correct source');

    const string = '123\n456789\n012';
    const re = RegExp('(\\d{3}).\\d{3}', 'sy');

    let match = re.exec(string);
    assert.same(match[1], '123', 's with y #1');
    assert.same(re.lastIndex, 7, 's with y #2');

    match = re.exec(string);
    assert.same(match[1], '789', 's with y #3');
    assert.same(re.lastIndex, 14, 's with y #4');

    // dotAll combined with NCG - groups should be populated
    const dotAllNCG = RegExp('(?<a>.).(?<b>.)', 's').exec('a\nb');
    assert.same(dotAllNCG?.groups?.a, 'a', 'dotAll + NCG groups #1');
    assert.same(dotAllNCG?.groups?.b, 'b', 'dotAll + NCG groups #2');
  });

  QUnit.test('RegExp NCG', assert => {
    assert.same(RegExp('(?<a>b)').exec('b').groups?.a, 'b', 'NCG #1');
    // eslint-disable-next-line regexp/no-unused-capturing-group -- required for testing
    assert.same(RegExp('(b)').exec('b').groups, undefined, 'NCG #2');
    const { groups } = RegExp('foo:(?<foo>\\w+),bar:(?<bar>\\w+)').exec('foo:abc,bar:def');
    assert.same(getPrototypeOf(groups), null, 'null prototype');
    assert.deepEqual(groups, { foo: 'abc', bar: 'def' }, 'NCG #3');
    // eslint-disable-next-line regexp/no-useless-non-capturing-group -- required for testing
    const { groups: nonCaptured, length } = RegExp('foo:(?:value=(?<foo>\\w+)),bar:(?:value=(?<bar>\\w+))').exec('foo:value=abc,bar:value=def');
    assert.deepEqual(nonCaptured, { foo: 'abc', bar: 'def' }, 'NCG #4');
    assert.same(length, 3, 'incorrect number of matched entries #1');

    // eslint-disable-next-line regexp/no-unused-capturing-group -- required for testing
    const { groups: skipBar } = RegExp('foo:(?<foo>\\w+),bar:(\\w+),buz:(?<buz>\\w+)').exec('foo:abc,bar:def,buz:ghi');
    assert.deepEqual(skipBar, { foo: 'abc', buz: 'ghi' }, 'NCG #5');

    // fails in Safari
    // assert.same(Object.getPrototypeOf(groups), null, 'NCG #4');
    assert.same('foo:abc,bar:def'.replace(RegExp('foo:(?<foo>\\w+),bar:(?<bar>\\w+)'), '$<bar>,$<foo>'), 'def,abc', 'replace #1');
    assert.same('foo:abc,bar:def'.replace(RegExp('foo:(?<foo>\\w+),bar:(?<bar>\\w+)'), (...args) => {
      const { foo, bar } = args.pop();
      return `${ bar },${ foo }`;
    }), 'def,abc', 'replace #2');
    assert.same('12345'.replaceAll(RegExp('(?<d>[2-4])', 'g'), '$<d>$<d>'), '12233445', 'replaceAll');
    assert.throws(() => RegExp('(?<1a>b)'), SyntaxError, 'incorrect group name #1');
    assert.throws(() => RegExp('(?<a#>b)'), SyntaxError, 'incorrect group name #2');
    assert.throws(() => RegExp('(?< a >b)'), SyntaxError, 'incorrect group name #3');

    // regression — lookahead / lookbehind assertions should not increment group counter
    assert.same(RegExp('(?=b)(?<a>b)').exec('b').groups?.a, 'b', 'NCG with positive lookahead');
    assert.same(RegExp('(?!c)(?<a>b)').exec('b').groups?.a, 'b', 'NCG with negative lookahead');
    // prevent crash in ancient engines without lookbehind support
    try {
      assert.same(RegExp('(?<=a)(?<b>b)').exec('ab').groups?.b, 'b', 'NCG with positive lookbehind');
      assert.same(RegExp('(?<!c)(?<a>b)').exec('ab').groups?.a, 'b', 'NCG with negative lookbehind');
    } catch { /* empty */ }
    // eslint-disable-next-line regexp/no-unused-capturing-group -- required for testing
    assert.same(RegExp('(?=b)(b)(?<a>c)').exec('bc').groups?.a, 'c', 'NCG with lookahead and capturing group');
  });
}
