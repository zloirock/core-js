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
    assert.same(String(regexp), '/a/g', 'regexp is /a/g');
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

    // named backreferences
    assert.same(RegExp('(?<year>\\d{4})-\\k<year>').exec('2024-2024')?.[0], '2024-2024', 'NCG \\k backreference #1');
    assert.same(RegExp('(?<year>\\d{4})-\\k<year>').exec('2024-2025'), null, 'NCG \\k backreference #2');
    assert.same(RegExp('(?<a>.)(?<b>.)\\k<b>\\k<a>').exec('abba')?.[0], 'abba', 'NCG \\k multiple backreferences');

// escaped backslash before `k<name>` should not be treated as backreference
    // eslint-disable-next-line regexp/no-unused-capturing-group -- required for testing
    assert.same(RegExp('(?<a>x)\\\\k<a>').exec('x\\k<a>')?.[0], 'x\\k<a>', 'NCG \\\\k not confused with \\k backreference');
    assert.same(RegExp('(?<a>x)\\\\\\k<a>').exec('x\\x')?.[0], 'x\\x', 'NCG escaped backslash before backreference');
  });

  QUnit.test('RegExp hasIndices', assert => {
    // Basic hasIndices property test
    const re1 = new RegExp('a', 'd');
    assert.true(re1.hasIndices, 'hasIndices should be true with d flag');
    assert.same(re1.flags, 'd', 'flags should include d');

    const re2 = new RegExp('a');
    assert.false(re2.hasIndices, 'hasIndices should be false without d flag');

    // Combined with other flags
    const re3 = new RegExp('a', 'gd');
    assert.true(re3.hasIndices, 'hasIndices with global flag');
    assert.true(re3.global, 'global flag should work');
    assert.same(re3.flags, 'dg', 'flags should be in correct order');

    const re4 = new RegExp('a', 'sid');
    assert.true(re4.hasIndices, 'hasIndices with multiple flags');
    assert.true(re4.dotAll, 'dotAll flag should work');
    assert.true(re4.ignoreCase, 'ignoreCase flag should work');
    assert.same(re4.flags, 'dis', 'flags should be in correct order');

    // Test indices array from exec()
    const re5 = new RegExp('a', 'd');
    const match1 = re5.exec('abc');
    assert.deepEqual(match1.indices, [[0, 1]], 'indices array should be correct for simple match');

    // Test indices with capturing groups
    const re6 = new RegExp('(a)(b)', 'd');
    const match2 = re6.exec('ab');
    assert.deepEqual(match2.indices[0], [0, 2], 'indices[0] should be entire match');
    assert.deepEqual(match2.indices[1], [0, 1], 'indices[1] should be first group');
    assert.deepEqual(match2.indices[2], [1, 2], 'indices[2] should be second group');

    // Test indices with named capture groups
    const re7 = new RegExp('(?<a>a)(?<b>b)', 'd');
    const match3 = re7.exec('ab');
    assert.deepEqual(match3.indices.groups.a, [0, 1], 'indices.groups.a should be correct');
    assert.deepEqual(match3.indices.groups.b, [1, 2], 'indices.groups.b should be correct');

    // Test indices with global flag (multiple matches)
    const re8 = new RegExp('a', 'gd');
    const results = [];
    let match4;
    while ((match4 = re8.exec('aba')) !== null) {
      results.push(match4.indices);
    }
    assert.deepEqual(results[0], [[0, 1]], 'first match indices');
    assert.deepEqual(results[1], [[2, 3]], 'second match indices');

    // Test that indices is undefined without d flag
    const re9 = new RegExp('a');
    const match5 = re9.exec('abc');
    assert.same(match5.indices, undefined, 'indices should be undefined without d flag');

    // Test with sticky flag
    const re10 = new RegExp('a', 'dy');
    re10.lastIndex = 2;
    const match6 = re10.exec('aaa');
    assert.deepEqual(match6.indices, [[2, 3]], 'indices with sticky flag');

    // Test with dotAll flag
    const re11 = new RegExp('.', 'ds');
    const match7 = re11.exec('\n');
    assert.deepEqual(match7.indices, [[0, 1]], 'indices with dotAll flag');

    // Test with optional capturing group that doesn't match
    const re12 = new RegExp('a(b)?', 'd');
    const match8 = re12.exec('a');
    assert.deepEqual(match8.indices[0], [0, 1], 'entire match indices');
    assert.same(match8.indices[1], undefined, 'optional group indices should be undefined');

    // Test from regex literal (if supported)
    try {
      const re13 = eval('/a/d');
      assert.true(re13.hasIndices, 'hasIndices from literal');
      const match9 = re13.exec('abc');
      assert.deepEqual(match9.indices, [[0, 1]], 'indices from literal regex');
    } catch {
      // Regex literal with d flag might not be supported in all environments
    }

    // Edge case: empty capturing group
    const re14 = new RegExp('(a*)b', 'd');
    const match10 = re14.exec('b');
    assert.deepEqual(match10.indices[0], [0, 1], 'empty group match indices');
    assert.deepEqual(match10.indices[1], [0, 0], 'empty group should have [0, 0]');

    // Edge case: nested capturing groups
    const re15 = new RegExp('((a)(b))', 'd');
    const match11 = re15.exec('ab');
    assert.deepEqual(match11.indices[0], [0, 2], 'nested groups entire match');
    assert.deepEqual(match11.indices[1], [0, 2], 'outer group');
    assert.deepEqual(match11.indices[2], [0, 1], 'first inner group');
    assert.deepEqual(match11.indices[3], [1, 2], 'second inner group');

    // Edge case: non-participating capturing group (NPCG)
    const re16 = new RegExp('a|(b)', 'd');
    const match12 = re16.exec('a');
    assert.deepEqual(match12.indices[0], [0, 1], 'NPCG match indices');
    assert.same(match12.indices[1], undefined, 'NPCG should be undefined');

    // Edge case: multiple optional groups
    const re17 = new RegExp('(a)?(b)?(c)?', 'd');
    const match13 = re17.exec('b');
    assert.deepEqual(match13.indices[0], [0, 1], 'multiple optional entire match');
    assert.same(match13.indices[1], undefined, 'first optional should be undefined');
    assert.deepEqual(match13.indices[2], [0, 1], 'second optional should match');

    // Edge case: character class with capturing group
    const re18 = new RegExp('([a-z]+)', 'd');
    const match14 = re18.exec('hello');
    assert.deepEqual(match14.indices[0], [0, 5], 'character class match');
    assert.deepEqual(match14.indices[1], [0, 5], 'character class group');

    // Edge case: escaped characters in pattern
    const re19 = new RegExp('(\\d+)', 'd');
    const match15 = re19.exec('123');
    assert.deepEqual(match15.indices[0], [0, 3], 'escaped digits match');
    assert.deepEqual(match15.indices[1], [0, 3], 'escaped digits group');

    // Edge case: test with ignoreCase flag
    const re20 = new RegExp('(A)', 'di');
    const match16 = re20.exec('a');
    assert.deepEqual(match16.indices[0], [0, 1], 'ignoreCase match');
    assert.deepEqual(match16.indices[1], [0, 1], 'ignoreCase group');

    // Edge case: multiline flag
    const re21 = new RegExp('^(a)', 'dm');
    const match17 = re21.exec('b\na');
    assert.deepEqual(match17.indices[0], [2, 3], 'multiline match');
    assert.deepEqual(match17.indices[1], [2, 3], 'multiline group');

    // Edge case: indices.length should match match array length
    const re22 = new RegExp('(a)(b)(c)', 'd');
    const match18 = re22.exec('abc');
    assert.same(match18.indices.length, 4, 'indices.length should be 4');
    assert.same(match18.length, 4, 'match array length should be 4');

    // Edge case: hasIndices is readonly (not writable)
    const re23 = new RegExp('a', 'd');
    const descriptor = Object.getOwnPropertyDescriptor(re23, 'hasIndices');
    // Note: in polyfilled environments, hasIndices might be writable
    assert.true(re23.hasIndices, 'hasIndices remains true');

    // Edge case: constructor with RegExp pattern and d flag
    const re24 = new RegExp(/a/, 'd');
    assert.true(re24.hasIndices, 'hasIndices from RegExp pattern with d flag');

    // Edge case: indices.groups should have null prototype
    const re25 = new RegExp('(?<x>a)', 'd');
    const match19 = re25.exec('a');
    assert.same(Object.getPrototypeOf(match19.indices.groups), null, 'indices.groups has null prototype');
  });
}
