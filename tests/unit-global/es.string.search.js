/* eslint-disable prefer-regex-literals -- required for testing */
import { GLOBAL } from '../helpers/constants.js';
import { patchRegExp$exec } from '../helpers/helpers.js';

const Symbol = GLOBAL.Symbol || {};

const run = assert => {
  assert.isFunction(''.search);
  assert.arity(''.search, 1);
  assert.name(''.search, 'search');
  assert.looksNative(''.search);
  assert.nonEnumerable(String.prototype, 'search');
  let instance = Object(true);
  instance.search = String.prototype.search;
  assert.same(instance.search(true), 0, 'S15.5.4.12_A1_T1');
  instance = Object(false);
  instance.search = String.prototype.search;
  assert.same(instance.search(false), 0, 'S15.5.4.12_A1_T2');
  assert.same(''.search(), 0, 'S15.5.4.12_A1_T4 #1');
  assert.same('--undefined--'.search(), 0, 'S15.5.4.12_A1_T4 #2');
  assert.same('gnulluna'.search(null), 1, 'S15.5.4.12_A1_T5');
  assert.same(Object('undefined').search(undefined), 0, 'S15.5.4.12_A1_T6');
  assert.same('undefined'.search(undefined), 0, 'S15.5.4.12_A1_T7');
  assert.same(String({
    toString() { /* empty */ },
  }).search(undefined), 0, 'S15.5.4.12_A1_T8');
  assert.same('ssABB\u0041BABAB'.search({
    toString() {
      return '\u0041B';
    },
  }), 2, 'S15.5.4.12_A1_T10');
  try {
    'ABB\u0041BABAB'.search({
      toString() {
        throw new Error('intostr');
      },
    });
    assert.avoid('S15.5.4.12_A1_T11 #1 lead to throwing exception');
  } catch (error) {
    assert.same(error.message, 'intostr', 'S15.5.4.12_A1_T11 #2');
  }
  try {
    Object('ABB\u0041BABAB').search({
      toString() {
        return {};
      },
      valueOf() {
        throw new Error('intostr');
      },
    });
    assert.avoid('S15.5.4.12_A1_T12 #1 lead to throwing exception');
  } catch (error) {
    assert.same(error.message, 'intostr', 'S15.5.4.12_A1_T12 #2');
  }
  assert.same('ABB\u0041B\u0031ABAB\u0031BBAA'.search({
    toString() {
      return {};
    },
    valueOf() {
      return 1;
    },
  }), 5, 'S15.5.4.12_A1_T13');
  assert.same('ABB\u0041BABAB\u0037\u0037BBAA'.search(RegExp('77')), 9, 'S15.5.4.12_A1_T14');
  assert.same(Object('test string').search('string'), 5, 'S15.5.4.12_A2_T1');
  assert.same(Object('test string').search('String'), -1, 'S15.5.4.12_A2_T2');
  assert.same(Object('test string').search(/string/i), 5, 'S15.5.4.12_A2_T3');
  assert.same(Object('test string').search(/Four/), -1, 'S15.5.4.12_A2_T4');
  assert.same(Object('one two three four five').search(/four/), 14, 'S15.5.4.12_A2_T5');
  assert.same(Object('test string').search('nonexistent'), -1, 'S15.5.4.12_A2_T6');
  assert.same(Object('test string probe').search('string pro'), 5, 'S15.5.4.12_A2_T7');
  let string = Object('power of the power of the power of the power of the power of the power of the great sword');
  assert.same(string.search(/the/), string.search(/the/g), 'S15.5.4.12_A3_T1');
  string = Object('power \u006F\u0066 the power of the power \u006F\u0066 the power of the power \u006F\u0066 the power of the great sword');
  assert.same(string.search(/of/), string.search(/of/g), 'S15.5.4.12_A3_T2');

  assert.throws(() => ''.search.call(Symbol('search test'), /./), 'throws on symbol context');
};

QUnit.test('String#search regression', run);

QUnit.test('RegExp#@@search appearance', assert => {
  const search = /./[Symbol.search];
  assert.isFunction(search);
  // assert.name(search, '[Symbol.search]');
  assert.arity(search, 1);
  assert.looksNative(search);
  assert.nonEnumerable(RegExp.prototype, Symbol.search);
});

QUnit.test('RegExp#@@search basic behavior', assert => {
  assert.same(/four/[Symbol.search]('one two three four five'), 14);
  assert.same(/Four/[Symbol.search]('one two three four five'), -1);
});

QUnit.test('String#search delegates to @@search', assert => {
  const string = 'string';
  const number = 42;
  const object = {};
  /* eslint-disable es/no-nonstandard-number-prototype-properties -- @@search */
  object[Symbol.search] = function (it) {
    return { value: it };
  };
  assert.same(string.search(object).value, string);
  assert.same(''.search.call(number, object).value, number);
  const regexp = /./;
  regexp[Symbol.search] = function (it) {
    return { value: it };
  };
  assert.same(string.search(regexp).value, string);
  assert.same(''.search.call(number, regexp).value, number);
  /* eslint-enable es/no-nonstandard-number-prototype-properties -- @@search */
});

QUnit.test('RegExp#@@search delegates to exec', assert => {
  let execCalled = false;
  let re = /b/;
  re.lastIndex = 7;
  re.exec = function (...args) {
    execCalled = true;
    return /./.exec.apply(this, args);
  };
  assert.deepEqual(re[Symbol.search]('abc'), 1);
  assert.true(execCalled);
  assert.same(re.lastIndex, 7);

  re = /b/;
  // Not a function, should be ignored
  re.exec = 3;
  assert.deepEqual(re[Symbol.search]('abc'), 1);

  re = /b/;
  // Does not return an object, should throw
  re.exec = () => 3;
  assert.throws(() => re[Symbol.search]('abc'));
});

QUnit.test('RegExp#@@search implementation', patchRegExp$exec(run));
