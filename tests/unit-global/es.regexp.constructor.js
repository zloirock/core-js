/* eslint-disable regexp/no-invalid-regexp, regexp/sort-flags -- required for testing */
/* eslint-disable regexp/no-useless-assertions, regexp/no-useless-character-class, regexp/no-useless-flag -- required for testing */
import { DESCRIPTORS, GLOBAL } from '../helpers/constants.js';
import { nativeSubclass } from '../helpers/helpers.js';

const { defineProperty, getPrototypeOf, hasOwn } = Object;

if (DESCRIPTORS) {
  const canSetSourceGetter = (() => {
    const re = /a/;
    try {
      defineProperty(re, 'source', { configurable: true, get: () => 'b' });
      return re.source === 'b';
    } catch { return false; }
  })();

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
    const mixed = RegExp('(?<part>[./]\\.)/.\n', 's');
    assert.same(mixed.exec('/./\n\n')?.groups?.part, '/.', 'dotAll preserves character classes and escapes');
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

  QUnit.test('RegExp copies named groups', assert => {
    const re = RegExp('(?<letter>b)\\k<letter>', 'g');
    re.lastIndex = 2;
    const copy = new RegExp(re);
    assert.same(copy.lastIndex, 0);
    assert.same(copy.exec('bb')?.groups?.letter, 'b');
    assert.same(RegExp(copy, 'i').exec('BB')?.groups?.letter, 'B');
    assert.same('bb'.replace(new RegExp(copy), '<$<letter>>'), '<b>');
    assert.same(re.lastIndex, 2);
    assert.same(hasOwn(RegExp('a\\\\/b'), 'source'), hasOwn(/a/, 'source'), 'untranslated patterns keep the native source');

    if (canSetSourceGetter) {
      assert.same(re.source, '(?<letter>b)\\k<letter>');
      let reads = 0;
      defineProperty(re, 'source', { configurable: true, get() {
        reads++;
        return 'other';
      } });
      assert.same(new RegExp(re).exec('bb')?.groups?.letter, 'b', 'copies the original pattern');
      re.lastIndex = 0;
      assert.same(re.exec('bb')?.groups?.letter, 'b');
      assert.same(reads, 0, 'copy and exec use the original pattern');
      assert.same(String(re), '/other/g', 'toString reads the public source');
      assert.same(reads, 1);
    }
  });

  // eslint-disable-next-line es/no-regexp-prototype-compile -- test Annex B reinitialization
  const { compile } = RegExp.prototype;
  if (compile) QUnit.test('RegExp#compile reinitializes emulated patterns and flags', assert => {
    const re = /a/;
    const pattern = { toString: () => '(?<part>.)\\k<part>' };
    defineProperty(pattern, GLOBAL.Symbol.match, { get: () => assert.avoid('compile should not read @@match') });
    defineProperty(pattern, GLOBAL.Symbol.toStringTag, { get: () => assert.avoid('compile should not read @@toStringTag') });
    assert.throws(() => compile.call(RegExp.prototype, pattern, 'sy'), TypeError);
    const inherited = Object.create(/original/);
    inherited.toString = () => 'converted';
    assert.throws(() => compile.call(inherited, pattern), TypeError);
    assert.true(compile.call(re, inherited).test('converted'), 'an object inheriting from a RegExp is converted to a string');
    assert.same(compile.call(re, pattern, 'sy'), re);
    assert.same(re.exec('\n\n')?.groups?.part, '\n');
    assert.same(re.lastIndex, 2);
    assert.throws(() => compile.call(re, /b/, 'i'), TypeError);
    assert.throws(() => compile.call(re, '['), SyntaxError);
    assert.same(re.lastIndex, 2, 'a failed compile keeps lastIndex');
    for (const flags of ['ss', 'yy', 'sys']) {
      assert.throws(() => RegExp('.', flags), SyntaxError);
      assert.throws(() => compile.call(re, '.', flags), SyntaxError);
    }

    for (const flag of ['s', 'y']) {
      const from = RegExp('.', `g${ flag }`);
      from.lastIndex = 3;
      compile.call(re, from);
      assert.same(from.lastIndex, 3, 'checking the matcher keeps the argument lastIndex');
      assert.same(re.flags, from.flags, 'copies the flags from a RegExp');
      assert.same(re.test('\n'), flag === 's');
      compile.call(from, 'b');
      assert.same(from.flags, '', 'clears the flag without a saved source');
      assert.false(from.test('\n'));
      assert.true(from.test('ab'));
      assert.same(re.flags, `g${ flag }`, 'recompiling the argument leaves the copy intact');
    }
  });

  if (compile) QUnit.test('RegExp copies after recompiling named groups', assert => {
    const re = RegExp('(?<letter>b)');
    re.lastIndex = 3;
    compile.call(re, re);
    assert.same(re.lastIndex, 0, 'self copy resets lastIndex');
    assert.same(re.exec('b')?.groups?.letter, 'b', 'self copy');
    const other = /a/;
    re.lastIndex = 3;
    compile.call(other, re);
    assert.same(other.lastIndex, 0, 'the target starts at zero');
    assert.same(re.lastIndex, 3, 'the source retains its lastIndex');
    assert.same(other.exec('b')?.groups?.letter, 'b', 'copy into a different regexp');
    assert.same(String(other), '/(?<letter>b)/');
    if (canSetSourceGetter) assert.same(other.source, '(?<letter>b)', 'recompilation preserves the named source');
    const frozenIndex = /a/;
    defineProperty(frozenIndex, 'lastIndex', { writable: false });
    try {
      compile.call(frozenIndex, re);
    } catch (error) { assert.true(error instanceof TypeError); }
    assert.same(new RegExp(frozenIndex).exec('b')?.groups?.letter, 'b', 'the matcher changes before resetting lastIndex');
    assert.throws(() => compile.call(re, '['), SyntaxError);
    assert.same(new RegExp(re).exec('b')?.groups?.letter, 'b', 'failed compilation preserves the pattern');
    const nested = /a/;
    compile.call(nested, { toString() {
      compile.call(nested, re);
      return 'c';
    } });
    assert.same(String(nested), '/c/', 'outer compilation wins after coercion');
    assert.true(new RegExp(nested).test('c'));
    compile.call(re, '(b)');
    assert.same(re.source, '(b)', 'recompilation drops the old source');
    assert.same(new RegExp(re).exec('b').groups, undefined, 'recompiling the same native pattern drops the name');
    assert.same(String(re), '/(b)/');
    compile.call(re, 'c');
    assert.same(new RegExp(re).exec('c').groups, undefined);
    if (canSetSourceGetter) {
      defineProperty(other, 'source', { configurable: true, get: () => 'public\nsource' });
      compile.call(other, RegExp('(?<letter>d)'));
      assert.same(other.source, 'public\nsource', 'recompiling a named pattern preserves the own getter');
      assert.same(other.exec('d')?.groups?.letter, 'd');
      compile.call(other, 'c');
      assert.same(String(other), '/public\nsource/', 'toString preserves the public getter after compile');
      if (GLOBAL.Symbol?.toStringTag) defineProperty(other, GLOBAL.Symbol.toStringTag, { get() {
        throw new Error('unexpected toStringTag access');
      } });
      assert.same(new RegExp(other, 'i').source, 'c', 'a copy uses the recompiled matcher');
    }
  });
}
