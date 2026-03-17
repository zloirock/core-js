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
      // eslint-disable-next-line no-eval -- required for testing regex literal
      const re13 = eval('/a/d');
      assert.true(re13.hasIndices, 'hasIndices from literal');
      const match9 = re13.exec('abc');
      assert.deepEqual(match9.indices, [[0, 1]], 'indices from literal regex');
    } catch {
      // Regex literal with d flag might not be supported in all environments
    }

    // Edge case: empty capturing group
    // eslint-disable-next-line sonarjs/slow-regex -- required for testing
    const re14 = new RegExp('(a*)b', 'd');
    const match10 = re14.exec('b');
    assert.deepEqual(match10.indices[0], [0, 1], 'empty group match indices');
    assert.deepEqual(match10.indices[1], [0, 0], 'empty group should have [0, 0]');

    // Edge case: duplicate captured strings - each should get correct position
    const re14a = new RegExp('(b)(a)(b)', 'd');
    const match10a = re14a.exec('bab');
    assert.deepEqual(match10a.indices[0], [0, 3], 'duplicate strings entire match');
    assert.deepEqual(match10a.indices[1], [0, 1], 'first b should be [0, 1]');
    assert.deepEqual(match10a.indices[2], [1, 2], 'a should be [1, 2]');
    assert.deepEqual(match10a.indices[3], [2, 3], 'second b should be [2, 3]');

    // Edge case: empty capturing group after non-empty capture
    const re14b = new RegExp('(x)(a*)b', 'd');
    const match10b = re14b.exec('xb');
    assert.deepEqual(match10b.indices[0], [0, 2], 'empty after non-empty entire match');
    assert.deepEqual(match10b.indices[1], [0, 1], 'x should be [0, 1]');
    assert.deepEqual(match10b.indices[2], [1, 1], 'empty a* should be [1, 1] after x');

    // Edge case: overlapping capturing groups
    const re14c = new RegExp('(ab)(b)', 'd');
    const match10c = re14c.exec('abb');
    assert.deepEqual(match10c.indices[0], [0, 3], 'overlapping entire match');
    assert.deepEqual(match10c.indices[1], [0, 2], 'ab should be [0, 2]');
    assert.deepEqual(match10c.indices[2], [2, 3], 'second b should be [2, 3]');

    // Edge case: nested groups with repeated substrings
    const re14d = new RegExp('(a)(aa)(a)', 'd');
    const match10d = re14d.exec('aaaa');
    assert.deepEqual(match10d.indices[0], [0, 4], 'repeated substrings entire match');
    assert.deepEqual(match10d.indices[1], [0, 1], 'first a should be [0, 1]');
    assert.deepEqual(match10d.indices[2], [1, 3], 'aa should be [1, 3]');
    assert.deepEqual(match10d.indices[3], [3, 4], 'last a should be [3, 4]');

    // Edge case: nested capturing groups
    const re15 = new RegExp('((a)(b))', 'd');
    const match11 = re15.exec('ab');
    assert.deepEqual(match11.indices[0], [0, 2], 'nested groups entire match');
    assert.deepEqual(match11.indices[1], [0, 2], 'outer group');
    assert.deepEqual(match11.indices[2], [0, 1], 'first inner group');
    assert.deepEqual(match11.indices[3], [1, 2], 'second inner group');

    // Edge case: deeply nested capturing groups (from maintainer review)
    const re15a = new RegExp('x((a+)(b+))', 'd');
    const match11a = re15a.exec('xaabb');
    if (match11a) {
      assert.deepEqual(match11a.indices[0], [0, 5], 'deeply nested entire match');
      assert.deepEqual(match11a.indices[1], [1, 5], 'outer nested group (aabb)');
      assert.deepEqual(match11a.indices[2], [1, 3], 'inner a+ group (aa)');
      assert.deepEqual(match11a.indices[3], [3, 5], 'inner b+ group (bb)');
    }

    const re15b = new RegExp('((a)(a))', 'd');
    const match11b = re15b.exec('aa');
    if (match11b) {
      assert.deepEqual(match11b.indices[0], [0, 2], 'nested same char entire match');
      assert.deepEqual(match11b.indices[1], [0, 2], 'outer group (aa)');
      assert.deepEqual(match11b.indices[2], [0, 1], 'first a group');
      assert.deepEqual(match11b.indices[3], [1, 2], 'second a group');
    }

    const re15c = new RegExp('(((ab)c)d)', 'd');
    const match11c = re15c.exec('abcd');
    if (match11c) {
      assert.deepEqual(match11c.indices[0], [0, 4], 'deeply nested chain entire match');
      assert.deepEqual(match11c.indices[1], [0, 4], 'outer (abcd)');
      assert.deepEqual(match11c.indices[2], [0, 3], 'middle (abc)');
      assert.deepEqual(match11c.indices[3], [0, 2], 'inner (ab)');
    }

    const re15d = new RegExp('ab((ab)(c))', 'd');
    const match11d = re15d.exec('ababc');
    if (match11d) {
      assert.deepEqual(match11d.indices[0], [0, 5], 'prefix with nested entire match');
      assert.deepEqual(match11d.indices[1], [2, 5], 'nested group (abc)');
      assert.deepEqual(match11d.indices[2], [2, 4], 'inner ab group');
      assert.deepEqual(match11d.indices[3], [4, 5], 'inner c group');
    }

    const re15e = new RegExp('(a(b+))(c+)', 'd');
    const match11e = re15e.exec('abbcc');
    if (match11e) {
      assert.deepEqual(match11e.indices[0], [0, 5], 'non-overlapping groups entire match');
      assert.deepEqual(match11e.indices[1], [0, 3], 'outer group (abb)');
      assert.deepEqual(match11e.indices[2], [1, 3], 'inner b+ group (bb)');
      assert.deepEqual(match11e.indices[3], [3, 5], 'trailing c+ group (cc)');
    }

    // Edge case: non-participating capturing group (NPCG)
    const re16 = new RegExp('a|(b)', 'd');
    const match12 = re16.exec('a');
    assert.deepEqual(match12.indices[0], [0, 1], 'NPCG match indices');
    assert.same(match12.indices[1], undefined, 'NPCG should be undefined');

    // Edge case: multiple optional groups
    // eslint-disable-next-line regexp/no-unused-capturing-group -- required for testing
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
    // Testing case-insensitive matching with d flag
    const re20 = new RegExp('(a)', 'di');
    const match16 = re20.exec('A');
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

    // Edge case: hasIndices property descriptor
    const re23 = new RegExp('a', 'd');
    const descriptor = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(re23),
      'hasIndices',
    );
    if (descriptor) {
      // Native implementation should have getter but no setter
      assert.same(typeof descriptor.get, 'function', 'hasIndices should be a getter');
      assert.same(descriptor.set, undefined, 'hasIndices should not have setter');
    }
    // Verify hasIndices value
    assert.true(re23.hasIndices, 'hasIndices should be true');
    // Attempt to modify should fail silently (or throw in strict mode)
    try {
      re23.hasIndices = false;
      assert.true(re23.hasIndices, 'hasIndices should remain true after attempted modification');
    } catch (error) {
      // In strict mode, might throw TypeError
      assert.true(error instanceof TypeError, 'should throw TypeError in strict mode');
    }

    // Edge case: constructor with RegExp pattern and d flag
    const re24 = new RegExp(/a/, 'd');
    assert.true(re24.hasIndices, 'hasIndices from RegExp pattern with d flag');

    // Edge case: indices.groups should be undefined when no named groups (TC39 spec step 7a)
    // eslint-disable-next-line regexp/no-unused-capturing-group -- required for testing indices.groups
    const re24a = new RegExp('(a)', 'd');
    const match18a = re24a.exec('a');
    assert.same(match18a.indices.groups, undefined, 'indices.groups should be undefined without named groups');

    // Edge case: indices.groups should be undefined even with multiple unnamed groups
    // eslint-disable-next-line regexp/no-unused-capturing-group -- required for testing indices.groups
    const re24b = new RegExp('(a)(b)(c)', 'd');
    const match18b = re24b.exec('abc');
    assert.same(match18b.indices.groups, undefined, 'indices.groups should be undefined with multiple unnamed groups');

    // Edge case: indices.groups should have null prototype with named groups
    const re25 = new RegExp('(?<x>a)', 'd');
    const match19 = re25.exec('a');
    assert.same(Object.getPrototypeOf(match19.indices.groups), null, 'indices.groups has null prototype');

    // Edge case: indices.groups should have null prototype even with mixed named and unnamed groups
    // eslint-disable-next-line regexp/no-unused-capturing-group -- required for testing indices.groups
    const re25a = new RegExp('(a)(?<x>b)', 'd');
    const match19a = re25a.exec('ab');
    assert.same(Object.getPrototypeOf(match19a.indices.groups), null, 'indices.groups has null prototype with mixed groups');

    // Edge case: duplicate content in match string
    const re26 = new RegExp('(var)', 'gd');
    const duplicateResults = [];
    let match20;
    while ((match20 = re26.exec('var var')) !== null) {
      duplicateResults.push({ match: match20[0], index: match20.index, indices: match20.indices });
    }
    assert.same(duplicateResults.length, 2, 'should find two matches');
    assert.deepEqual(duplicateResults[0].indices, [[0, 3], [0, 3]], 'first match indices');
    assert.deepEqual(duplicateResults[1].indices, [[4, 7], [4, 7]], 'second match indices should start at 4');

    // Edge case: named groups with indices
    const re27 = new RegExp('(?<letter>[a-z])(?<digit>\\d)', 'd');
    const match21 = re27.exec('a1');
    assert.deepEqual(match21.indices.groups.letter, [0, 1], 'named group letter indices');
    assert.deepEqual(match21.indices.groups.digit, [1, 2], 'named group digit indices');

    // Edge case: optional named group that doesn't match
    const re28 = new RegExp('(?<a>a)?(?<b>b)?', 'd');
    const match22 = re28.exec('b');
    assert.same(match22.indices.groups.a, undefined, 'optional named group should be undefined');
    assert.deepEqual(match22.indices.groups.b, [0, 1], 'matched named group indices');

    // Edge case: non-capturing group should not appear in indices
    const re29 = new RegExp('foo(bar)', 'd');
    const match23 = re29.exec('foobar');
    assert.same(match23.length, 2, 'should have 2 elements in match array');
    assert.same(match23.indices.length, 2, 'should have 2 elements in indices');
    assert.deepEqual(match23.indices[0], [0, 6], 'entire match');
    assert.deepEqual(match23.indices[1], [3, 6], 'only capturing group');
    assert.same(match23.indices[2], undefined, 'non-capturing group not in indices');

    // Unicode: basic emoji with u flag
    try {
      const re30 = new RegExp('(.)', 'ud');
      const match24 = re30.exec('😀a');
      assert.deepEqual(match24.indices[0], [0, 2], 'emoji match with u flag');
      assert.deepEqual(match24.indices[1], [0, 2], 'emoji capture with u flag');
    } catch {
      // u flag not supported in all engines (e.g. PhantomJS)
    }

    // Unicode: without u flag (surrogate pairs)
    const re31 = new RegExp('(.)', 'd');
    const match25 = re31.exec('😀');
    assert.deepEqual(match25.indices[0], [0, 1], 'emoji high surrogate without u flag');
    assert.deepEqual(match25.indices[1], [0, 1], 'capture high surrogate');

    // Unicode: capturing emoji parts
    const re32 = new RegExp('(.)(.)', 'd');
    const match26 = re32.exec('😀');
    assert.same(match26.length, 3, 'should capture two surrogates');
    assert.deepEqual(match26.indices[0], [0, 2], 'entire emoji');
    assert.deepEqual(match26.indices[1], [0, 1], 'high surrogate');
    assert.deepEqual(match26.indices[2], [1, 2], 'low surrogate');

    // Unicode: multiple code units
    const re33 = new RegExp('(\\uD83D\\uDE00)', 'd');
    const match27 = re33.exec('😀');
    assert.deepEqual(match27.indices[0], [0, 2], 'explicit emoji pattern match');
    assert.deepEqual(match27.indices[1], [0, 2], 'explicit emoji pattern capture');

    // Unicode property escapes (if supported)
    try {
      const re34 = new RegExp('(\\p{Emoji})', 'ud');
      const match28 = re34.exec('Hello 😀 World');
      if (match28) {
        assert.deepEqual(match28.indices[0], [6, 8], 'emoji property escape match');
        assert.deepEqual(match28.indices[1], [6, 8], 'emoji property escape group');
      }
    } catch {
      // Unicode property escapes not supported
    }

    // Lookahead: positive
    const re38 = new RegExp('(foo)(?=bar)', 'd');
    const match29 = re38.exec('foobar');
    if (match29) {
      assert.deepEqual(match29.indices[0], [0, 3], 'lookahead match');
      assert.deepEqual(match29.indices[1], [0, 3], 'lookahead captured group');
    }

    // Lookahead: with capturing group inside
    const re39 = new RegExp('(foo)(?=(bar))', 'd');
    const match30 = re39.exec('foobar');
    if (match30) {
      assert.deepEqual(match30.indices[0], [0, 3], 'lookahead with capture entire match');
      assert.deepEqual(match30.indices[1], [0, 3], 'foo group');
      assert.deepEqual(match30.indices[2], [3, 6], 'bar group inside lookahead');
    }

    // Lookbehind: positive (if supported)
    try {
      const re40 = new RegExp('(?<=(foo))(bar)', 'd');
      const match31 = re40.exec('foobar');
      if (match31) {
        assert.deepEqual(match31.indices[0], [3, 6], 'lookbehind match');
        assert.deepEqual(match31.indices[1], [0, 3], 'captured in lookbehind');
        assert.deepEqual(match31.indices[2], [3, 6], 'main capture');
      }
    } catch {
      // Lookbehind not supported in all engines
    }

    // Negative lookahead
    const re41 = new RegExp('(foo)(?!bar)', 'd');
    const match32 = re41.exec('foobaz');
    if (match32) {
      assert.deepEqual(match32.indices[0], [0, 3], 'negative lookahead match');
      assert.deepEqual(match32.indices[1], [0, 3], 'negative lookahead group');
    }

    // Backreference
    // eslint-disable-next-line sonarjs/slow-regex -- required for testing
    const re42 = new RegExp('(\\w+) \\1', 'd');
    const match33 = re42.exec('foo foo');
    if (match33) {
      assert.deepEqual(match33.indices[0], [0, 7], 'backreference entire match');
      assert.deepEqual(match33.indices[1], [0, 3], 'backreference captured group');
    }

    // Backreference with named group
    // eslint-disable-next-line sonarjs/slow-regex -- required for testing
    const re43 = new RegExp('(?<word>\\w+) \\k<word>', 'd');
    const match34 = re43.exec('bar bar');
    if (match34) {
      assert.deepEqual(match34.indices[0], [0, 7], 'named backreference match');
      assert.deepEqual(match34.indices.groups.word, [0, 3], 'named backreference group');
    }

    // Nested groups with numeric backreference (from maintainer review)
    // The \2 references the inner group (a), both groups capture 'a' at position 0-1
    const reNestedBackref = new RegExp('((a))\\2', 'd');
    const matchNestedBackref = reNestedBackref.exec('aa');
    if (matchNestedBackref) {
      assert.deepEqual(matchNestedBackref.indices[0], [0, 2], 'nested backreference entire match');
      assert.deepEqual(matchNestedBackref.indices[1], [0, 1], 'outer group ((a)) captures same as inner');
      assert.deepEqual(matchNestedBackref.indices[2], [0, 1], 'inner group (a) - the one referenced by \\2');
    }

    // Nested groups with named backreference (from maintainer review)
    // eslint-disable-next-line sonarjs/slow-regex -- required for testing
    const reNamedBackref = new RegExp('((?<a>\\w+)) \\k<a>', 'd');
    const matchNamedBackref = reNamedBackref.exec('foo foo');
    if (matchNamedBackref) {
      assert.deepEqual(matchNamedBackref.indices[0], [0, 7], 'named backreference entire match');
      assert.deepEqual(matchNamedBackref.indices[1], [0, 3], 'outer group');
      // eslint-disable-next-line regexp/prefer-result-array-groups -- testing both indexed and named access
      assert.deepEqual(matchNamedBackref.indices[2], [0, 3], 'inner named group (?<a>)');
      // Use indices.groups.a to access named group indices (not match array)
      assert.deepEqual(matchNamedBackref.indices.groups.a, [0, 3], 'named group a indices');
    }

    // Greedy quantifier
    const re44 = new RegExp('(a+)', 'd');
    const match35 = re44.exec('aaa');
    assert.deepEqual(match35.indices[0], [0, 3], 'greedy match all');
    assert.deepEqual(match35.indices[1], [0, 3], 'greedy capture all');

    // Non-greedy quantifier - without following pattern, +? (min 1) equals to just one match
    const re45 = new RegExp('(a)', 'd');
    const match36 = re45.exec('aaa');
    assert.deepEqual(match36.indices[0], [0, 1], 'non-greedy match minimal');
    assert.deepEqual(match36.indices[1], [0, 1], 'non-greedy capture minimal');

    // Greedy in context
    // eslint-disable-next-line sonarjs/slow-regex -- required for testing
    const re46 = new RegExp('(a+)b', 'd');
    const match37 = re46.exec('aaab');
    assert.deepEqual(match37.indices[1], [0, 3], 'greedy consumes maximum before b');

    // Non-greedy quantifier with optional suffix - demonstrates minimal matching
    const re47 = new RegExp('(a+?)a', 'd');
    const match38 = re47.exec('aaa');
    assert.deepEqual(match38.indices[0], [0, 2], 'non-greedy entire match');
    assert.deepEqual(match38.indices[1], [0, 1], 'non-greedy captures minimum (one a)');

    // Word boundary
    const re48 = new RegExp('\\b(\\w+)\\b', 'd');
    const match39 = re48.exec('foo bar');
    assert.deepEqual(match39.indices[0], [0, 3], 'word boundary match');
    assert.deepEqual(match39.indices[1], [0, 3], 'word boundary capture');

    // Start anchor
    const re49 = new RegExp('^(foo)', 'd');
    const match40 = re49.exec('foobar');
    assert.deepEqual(match40.indices[1], [0, 3], 'start anchor capture');

    // End anchor
    const re50 = new RegExp('(bar)$', 'd');
    const match41 = re50.exec('foobar');
    assert.deepEqual(match41.indices[1], [3, 6], 'end anchor capture');

    // Both anchors
    const re51 = new RegExp('^(foo)$', 'd');
    const match42 = re51.exec('foo');
    assert.deepEqual(match42.indices[0], [0, 3], 'both anchors match');
    assert.deepEqual(match42.indices[1], [0, 3], 'both anchors capture');
  });
}
