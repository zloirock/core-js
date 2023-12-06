// TODO: fix escaping in regexps
/* eslint-disable prefer-regex-literals, regexp/prefer-regexp-exec -- required for testing */
import { GLOBAL, NATIVE } from '../helpers/constants.js';
import { patchRegExp$exec } from '../helpers/helpers.js';

const Symbol = GLOBAL.Symbol || {};

const run = assert => {
  assert.isFunction(''.match);
  assert.arity(''.match, 1);
  assert.name(''.match, 'match');
  assert.looksNative(''.match);
  assert.nonEnumerable(String.prototype, 'match');
  let instance = Object(true);
  instance.match = String.prototype.match;
  assert.same(instance.match(true)[0], 'true', 'S15.5.4.10_A1_T1');
  instance = Object(false);
  instance.match = String.prototype.match;
  assert.same(instance.match(false)[0], 'false', 'S15.5.4.10_A1_T2');
  let matched = ''.match();
  let expected = RegExp().exec('');
  assert.same(matched.length, expected.length, 'S15.5.4.10_A1_T4 #1');
  assert.same(matched.index, expected.index, 'S15.5.4.10_A1_T4 #2');
  assert.same(matched.input, expected.input, 'S15.5.4.10_A1_T4 #3');
  assert.same('gnulluna'.match(null)[0], 'null', 'S15.5.4.10_A1_T5');
  matched = Object('undefined').match(undefined);
  expected = RegExp(undefined).exec('undefined');
  assert.same(matched.length, expected.length, 'S15.5.4.10_A1_T6 #1');
  assert.same(matched.index, expected.index, 'S15.5.4.10_A1_T6 #2');
  assert.same(matched.input, expected.input, 'S15.5.4.10_A1_T6 #3');
  let object = { toString() { /* empty */ } };
  matched = String(object).match(undefined);
  expected = RegExp(undefined).exec('undefined');
  assert.same(matched.length, expected.length, 'S15.5.4.10_A1_T8 #1');
  assert.same(matched.index, expected.index, 'S15.5.4.10_A1_T8 #2');
  assert.same(matched.input, expected.input, 'S15.5.4.10_A1_T8 #3');
  object = { toString() { return '\u0041B'; } };
  let string = 'ABB\u0041BABAB';
  assert.same(string.match(object)[0], 'AB', 'S15.5.4.10_A1_T10');
  object = { toString() { throw new Error('intostr'); } };
  try {
    string.match(object);
    assert.avoid('S15.5.4.10_A1_T11 #1 lead to throwing exception');
  } catch (error) {
    assert.same(error.message, 'intostr', `S15.5.4.10_A1_T11 #1.1: Exception === "intostr". Actual: ${ error }`);
  }
  object = {
    toString() {
      return {};
    },
    valueOf() {
      throw new Error('intostr');
    },
  };
  try {
    string.match(object);
    assert.avoid('S15.5.4.10_A1_T12 #1 lead to throwing exception');
  } catch (error) {
    assert.same(error.message, 'intostr', `S15.5.4.10_A1_T12 #1.1: Exception === "intostr". Actual: ${ error }`);
  }
  object = {
    toString() {
      return {};
    },
    valueOf() {
      return 1;
    },
  };
  assert.same('ABB\u0041B\u0031ABAB\u0031BBAA'.match(object)[0], '1', 'S15.5.4.10_A1_T13 #1');
  assert.same('ABB\u0041B\u0031ABAB\u0031BBAA'.match(object).length, 1, 'S15.5.4.10_A1_T13 #2');
  let regexp = RegExp('77');
  assert.same('ABB\u0041BABAB\u0037\u0037BBAA'.match(regexp)[0], '77', 'S15.5.4.10_A1_T14');
  string = '1234567890';
  assert.same(string.match(3)[0], '3', 'S15.5.4.10_A2_T1 #1');
  assert.same(string.match(3).length, 1, 'S15.5.4.10_A2_T1 #2');
  assert.same(string.match(3).index, 2, 'S15.5.4.10_A2_T1 #3');
  assert.same(string.match(3).input, string, 'S15.5.4.10_A2_T1 #4');
  let matches = ['34', '34', '34'];
  string = '343443444';
  assert.same(string.match(/34/g).length, 3, 'S15.5.4.10_A2_T2 #1');
  for (let i = 0, { length } = matches; i < length; ++i) {
    assert.same(string.match(/34/g)[i], matches[i], 'S15.5.4.10_A2_T2 #2');
  }
  matches = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  string = '123456abcde7890';
  assert.same(string.match(/\d/g).length, 10, 'S15.5.4.10_A2_T3 #1');
  for (let i = 0, { length } = matches; i < length; ++i) {
    assert.same(string.match(/\d/g)[i], matches[i], 'S15.5.4.10_A2_T3 #2');
  }
  matches = ['12', '34', '56', '78', '90'];
  assert.same(string.match(/\d{2}/g).length, 5, 'S15.5.4.10_A2_T4 #1');
  for (let i = 0, { length } = matches; i < length; ++i) {
    assert.same(string.match(/\d{2}/g)[i], matches[i], 'S15.5.4.10_A2_T4 #2');
  }
  matches = ['ab', 'cd'];
  assert.same(string.match(/\D{2}/g).length, 2, 'S15.5.4.10_A2_T5 #1');
  for (let i = 0, { length } = matches; i < length; ++i) {
    assert.same(string.match(/\D{2}/g)[i], matches[i], 'S15.5.4.10_A2_T5 #2');
  }
  string = 'Boston, Mass. 02134';
  assert.same(string.match(/(\d{5})([ -]?\d{4})?$/)[0], '02134', 'S15.5.4.10_A2_T6 #1');
  assert.same(string.match(/(\d{5})([ -]?\d{4})?$/)[1], '02134', 'S15.5.4.10_A2_T6 #2');
  if (NATIVE) assert.same(string.match(/(\d{5})([ -]?\d{4})?$/)[2], undefined, 'S15.5.4.10_A2_T6 #3');
  assert.same(string.match(/(\d{5})([ -]?\d{4})?$/).length, 3, 'S15.5.4.10_A2_T6 #4');
  assert.same(string.match(/(\d{5})([ -]?\d{4})?$/).index, 14, 'S15.5.4.10_A2_T6 #5');
  assert.same(string.match(/(\d{5})([ -]?\d{4})?$/).input, string, 'S15.5.4.10_A2_T6 #6');
  assert.same(string.match(/(\d{5})([ -]?\d{4})?$/g).length, 1, 'S15.5.4.10_A2_T7 #1');
  assert.same(string.match(/(\d{5})([ -]?\d{4})?$/g)[0], '02134', 'S15.5.4.10_A2_T7 #2');
  /* IE8- buggy here (empty string instead of `undefined`), but we don't polyfill base `.match` logic
  matches = ['02134', '02134', undefined];
  string = 'Boston, MA 02134';
  regexp = /([\d]{5})([-\ ]?[\d]{4})?$/;
  regexp.lastIndex = 0;
  assert.same(string.match(regexp).length, 3, 'S15.5.4.10_A2_T8 #1');
  assert.same(string.match(regexp).index, string.lastIndexOf('0'), 'S15.5.4.10_A2_T8 #2');
  for (let i = 0, { length } = matches; i < length; ++i) {
    assert.same(string.match(regexp)[i], matches[i], 'S15.5.4.10_A2_T8 #3');
  }
  string = 'Boston, MA 02134';
  matches = ['02134', '02134', undefined];
  regexp = /([\d]{5})([-\ ]?[\d]{4})?$/;
  regexp.lastIndex = string.length;
  assert.same(string.match(regexp).length, 3, 'S15.5.4.10_A2_T9 #1');
  assert.same(string.match(regexp).index, string.lastIndexOf('0'), 'S15.5.4.10_A2_T9 #2');
  for (let i = 0, { length } = matches; i < length; ++i) {
    assert.same(string.match(regexp)[i], matches[i], 'S15.5.4.10_A2_T9 #3');
  }
  string = 'Boston, MA 02134';
  matches = ['02134', '02134', undefined];
  regexp = /([\d]{5})([-\ ]?[\d]{4})?$/;
  regexp.lastIndex = string.lastIndexOf('0');
  assert.same(string.match(regexp).length, 3, 'S15.5.4.10_A2_T10 #1');
  assert.same(string.match(regexp).index, string.lastIndexOf('0'), 'S15.5.4.10_A2_T10 #2');
  for (let i = 0, { length } = matches; i < length; ++i) {
    assert.same(string.match(regexp)[i], matches[i], 'S15.5.4.10_A2_T10 #3');
  }
  string = 'Boston, MA 02134';
  matches = ['02134', '02134', undefined];
  regexp = /([\d]{5})([-\ ]?[\d]{4})?$/;
  regexp.lastIndex = string.lastIndexOf('0') + 1;
  assert.same(string.match(regexp).length, 3, 'S15.5.4.10_A2_T11 #1');
  assert.same(string.match(regexp).index, string.lastIndexOf('0'), 'S15.5.4.10_A2_T11 #2');
  for (let i = 0, { length } = matches; i < length; ++i) {
    assert.same(string.match(regexp)[i], matches[i], 'S15.5.4.10_A2_T11 #3');
  }
  */
  string = 'Boston, MA 02134';
  regexp = /(\d{5})([ -]?\d{4})?$/g;
  assert.same(string.match(regexp).length, 1, 'S15.5.4.10_A2_T12 #1');
  assert.same(string.match(regexp)[0], '02134', 'S15.5.4.10_A2_T12 #2');
  regexp.lastIndex = 0;
  assert.same(string.match(regexp).length, 1, 'S15.5.4.10_A2_T13 #1');
  assert.same(string.match(regexp)[0], '02134', 'S15.5.4.10_A2_T13 #2');
  regexp.lastIndex = string.length;
  assert.same(string.match(regexp).length, 1, 'S15.5.4.10_A2_T14 #1');
  assert.same(string.match(regexp)[0], '02134', 'S15.5.4.10_A2_T14 #2');
  regexp.lastIndex = string.lastIndexOf('0');
  assert.same(string.match(regexp).length, 1, 'S15.5.4.10_A2_T15 #1');
  assert.same(string.match(regexp)[0], '02134', 'S15.5.4.10_A2_T15 #2');
  regexp.lastIndex = string.lastIndexOf('0') + 1;
  assert.same(string.match(regexp).length, 1, 'S15.5.4.10_A2_T16 #1');
  assert.same(string.match(regexp)[0], '02134', 'S15.5.4.10_A2_T16 #2');
  regexp = /0./;
  const number = 10203040506070809000;
  assert.same(''.match.call(number, regexp)[0], '02', 'S15.5.4.10_A2_T17 #1');
  assert.same(''.match.call(number, regexp).length, 1, 'S15.5.4.10_A2_T17 #2');
  assert.same(''.match.call(number, regexp).index, 1, 'S15.5.4.10_A2_T17 #3');
  assert.same(''.match.call(number, regexp).input, String(number), 'S15.5.4.10_A2_T17 #4');
  regexp.lastIndex = 0;
  assert.same(''.match.call(number, regexp)[0], '02', 'S15.5.4.10_A2_T18 #1');
  assert.same(''.match.call(number, regexp).length, 1, 'S15.5.4.10_A2_T18 #2');
  assert.same(''.match.call(number, regexp).index, 1, 'S15.5.4.10_A2_T18 #3');
  assert.same(''.match.call(number, regexp).input, String(number), 'S15.5.4.10_A2_T18 #4');

  assert.throws(() => ''.match.call(Symbol('match test'), /./), 'throws on symbol context');
};

QUnit.test('String#match regression', run);

QUnit.test('RegExp#@@match appearance', assert => {
  const match = /./[Symbol.match];
  assert.isFunction(match);
  // assert.name(match, '[Symbol.match]');
  assert.arity(match, 1);
  assert.looksNative(match);
  assert.nonEnumerable(RegExp.prototype, Symbol.match);
});

QUnit.test('RegExp#@@match basic behavior', assert => {
  const string = '123456abcde7890';
  const matches = ['12', '34', '56', '78', '90'];
  assert.same(/\d{2}/g[Symbol.match](string).length, 5);
  for (let i = 0, { length } = matches; i < length; ++i) {
    assert.same(/\d{2}/g[Symbol.match](string)[i], matches[i]);
  }
});

QUnit.test('String#match delegates to @@match', assert => {
  const string = 'string';
  const number = 42;
  const object = {};
  /* eslint-disable es/no-nonstandard-array-prototype-properties -- @@match */
  object[Symbol.match] = function (it) {
    return { value: it };
  };
  assert.same(string.match(object).value, string);
  assert.same(''.match.call(number, object).value, number);
  const regexp = /./;
  regexp[Symbol.match] = function (it) {
    return { value: it };
  };
  assert.same(string.match(regexp).value, string);
  assert.same(''.match.call(number, regexp).value, number);
  /* eslint-enable es/no-nonstandard-array-prototype-properties -- @@match */
});

QUnit.test('RegExp#@@match delegates to exec', assert => {
  const exec = function (...args) {
    execCalled = true;
    return /./.exec.apply(this, args);
  };

  let execCalled = false;
  let re = /[ac]/;
  re.exec = exec;
  assert.deepEqual(re[Symbol.match]('abc'), ['a']);
  assert.true(execCalled);

  re = /a/;
  // Not a function, should be ignored
  re.exec = 3;
  assert.deepEqual(re[Symbol.match]('abc'), ['a']);

  re = /a/;
  // Does not return an object, should throw
  re.exec = () => 3;
  assert.throws(() => re[Symbol.match]('abc'));
});

QUnit.test('RegExp#@@match implementation', patchRegExp$exec(run));
