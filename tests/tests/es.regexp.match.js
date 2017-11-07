var test = QUnit.test;
var Symbol = global.Symbol || {};

test('String#match regression', function (assert) {
  assert.isFunction(''.match);
  assert.arity(''.match, 1);
  assert.name(''.match, 'match');
  assert.looksNative(''.match);
  assert.nonEnumerable(String.prototype, 'match');
  var instance = Object(true);
  instance.match = String.prototype.match;
  assert.strictEqual(instance.match(true)[0], 'true', 'S15.5.4.10_A1_T1');
  instance = Object(false);
  instance.match = String.prototype.match;
  assert.strictEqual(instance.match(false)[0], 'false', 'S15.5.4.10_A1_T2');
  var matched = ''.match();
  var expected = RegExp().exec('');
  assert.strictEqual(matched.length, expected.length, 'S15.5.4.10_A1_T4 #1');
  assert.strictEqual(matched.index, expected.index, 'S15.5.4.10_A1_T4 #2');
  assert.strictEqual(matched.input, expected.input, 'S15.5.4.10_A1_T4 #3');
  assert.strictEqual('gnulluna'.match(null)[0], 'null', 'S15.5.4.10_A1_T5');
  matched = Object('undefined').match(undefined);
  expected = RegExp(undefined).exec('undefined');
  assert.strictEqual(matched.length, expected.length, 'S15.5.4.10_A1_T6 #1');
  assert.strictEqual(matched.index, expected.index, 'S15.5.4.10_A1_T6 #2');
  assert.strictEqual(matched.input, expected.input, 'S15.5.4.10_A1_T6 #3');
  var object = { toString: function () { /* empty */ } };
  matched = String(object).match(undefined);
  expected = RegExp(undefined).exec('undefined');
  assert.strictEqual(matched.length, expected.length, 'S15.5.4.10_A1_T8 #1');
  assert.strictEqual(matched.index, expected.index, 'S15.5.4.10_A1_T8 #2');
  assert.strictEqual(matched.input, expected.input, 'S15.5.4.10_A1_T8 #3');
  object = { toString: function () { return '\u0041B'; } };
  var string = 'ABB\u0041BABAB';
  assert.strictEqual(string.match(object)[0], 'AB', 'S15.5.4.10_A1_T10');
  object = { toString: function () { throw new Error('intostr'); } };
  string = 'ABB\u0041BABAB';
  try {
    string.match(object);
    assert.ok(false, 'S15.5.4.10_A1_T11 #1 lead to throwing exception');
  } catch (e) {
    assert.strictEqual(e.message, 'intostr', 'S15.5.4.10_A1_T11 #1.1: Exception === "intostr". Actual: ' + e);
  }
  object = {
    toString: function () {
      return {};
    },
    valueOf: function () {
      throw new Error('intostr');
    }
  };
  string = 'ABB\u0041BABAB';
  try {
    string.match(object);
    assert.ok(false, 'S15.5.4.10_A1_T12 #1 lead to throwing exception');
  } catch (e) {
    assert.strictEqual(e.message, 'intostr', 'S15.5.4.10_A1_T12 #1.1: Exception === "intostr". Actual: ' + e);
  }
  object = {
    toString: function () {
      return {};
    },
    valueOf: function () {
      return 1;
    }
  };
  assert.strictEqual('ABB\u0041B\u0031ABAB\u0031BBAA'.match(object)[0], '1', 'S15.5.4.10_A1_T13 #1');
  assert.strictEqual('ABB\u0041B\u0031ABAB\u0031BBAA'.match(object).length, 1, 'S15.5.4.10_A1_T13 #2');
  var regexp = RegExp('77');
  assert.strictEqual('ABB\u0041BABAB\u0037\u0037BBAA'.match(regexp)[0], '77', 'S15.5.4.10_A1_T14');
  string = '1234567890';
  assert.strictEqual(string.match(3)[0], '3', 'S15.5.4.10_A2_T1 #1');
  assert.strictEqual(string.match(3).length, 1, 'S15.5.4.10_A2_T1 #2');
  assert.strictEqual(string.match(3).index, 2, 'S15.5.4.10_A2_T1 #3');
  assert.strictEqual(string.match(3).input, string, 'S15.5.4.10_A2_T1 #4');
  var matches = ['34', '34', '34'];
  string = '343443444';
  assert.strictEqual(string.match(/34/g).length, 3, 'S15.5.4.10_A2_T2 #1');
  for (var i = 0, length = matches.length; i < length; ++i) {
    assert.strictEqual(string.match(/34/g)[i], matches[i], 'S15.5.4.10_A2_T2 #2');
  }
  matches = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  string = '123456abcde7890';
  assert.strictEqual(string.match(/\d{1}/g).length, 10, 'S15.5.4.10_A2_T3 #1');
  for (var i = 0, length = matches.length; i < length; ++i) {
    assert.strictEqual(string.match(/\d{1}/g)[i], matches[i], 'S15.5.4.10_A2_T3 #2');
  }
  matches = ['12', '34', '56', '78', '90'];
  string = '123456abcde7890';
  assert.strictEqual(string.match(/\d{2}/g).length, 5, 'S15.5.4.10_A2_T4 #1');
  for (var i = 0, length = matches.length; i < length; ++i) {
    assert.strictEqual(string.match(/\d{2}/g)[i], matches[i], 'S15.5.4.10_A2_T4 #2');
  }
  matches = ['ab', 'cd'];
  string = '123456abcde7890';
  assert.strictEqual(string.match(/\D{2}/g).length, 2, 'S15.5.4.10_A2_T5 #1');
  for (var i = 0, length = matches.length; i < length; ++i) {
    assert.strictEqual(string.match(/\D{2}/g)[i], matches[i], 'S15.5.4.10_A2_T5 #2');
  }
  string = 'Boston, Mass. 02134';
  assert.strictEqual(string.match(/([\d]{5})([-\ ]?[\d]{4})?$/)[0], '02134', 'S15.5.4.10_A2_T6 #1');
  assert.strictEqual(string.match(/([\d]{5})([-\ ]?[\d]{4})?$/)[1], '02134', 'S15.5.4.10_A2_T6 #2');
  NATIVE && assert.strictEqual(string.match(/([\d]{5})([-\ ]?[\d]{4})?$/)[2], undefined, 'S15.5.4.10_A2_T6 #3');
  assert.strictEqual(string.match(/([\d]{5})([-\ ]?[\d]{4})?$/).length, 3, 'S15.5.4.10_A2_T6 #4');
  assert.strictEqual(string.match(/([\d]{5})([-\ ]?[\d]{4})?$/).index, 14, 'S15.5.4.10_A2_T6 #5');
  assert.strictEqual(string.match(/([\d]{5})([-\ ]?[\d]{4})?$/).input, string, 'S15.5.4.10_A2_T6 #6');
  string = 'Boston, Mass. 02134';
  assert.strictEqual(string.match(/([\d]{5})([-\ ]?[\d]{4})?$/g).length, 1, 'S15.5.4.10_A2_T7 #1');
  assert.strictEqual(string.match(/([\d]{5})([-\ ]?[\d]{4})?$/g)[0], '02134', 'S15.5.4.10_A2_T7 #2');
  matches = ['02134', '02134', undefined];
  string = 'Boston, MA 02134';
  regexp = /([\d]{5})([-\ ]?[\d]{4})?$/;
  regexp.lastIndex = 0;
  assert.strictEqual(string.match(regexp).length, 3, 'S15.5.4.10_A2_T8 #1');
  assert.strictEqual(string.match(regexp).index, string.lastIndexOf('0'), 'S15.5.4.10_A2_T8 #2');
  for (var i = 0, length = matches.length; i < length; ++i) {
    assert.strictEqual(string.match(regexp)[i], matches[i], 'S15.5.4.10_A2_T8 #3');
  }
  string = 'Boston, MA 02134';
  matches = ['02134', '02134', undefined];
  regexp = /([\d]{5})([-\ ]?[\d]{4})?$/;
  regexp.lastIndex = string.length;
  assert.strictEqual(string.match(regexp).length, 3, 'S15.5.4.10_A2_T9 #1');
  assert.strictEqual(string.match(regexp).index, string.lastIndexOf('0'), 'S15.5.4.10_A2_T9 #2');
  for (var i = 0, length = matches.length; i < length; ++i) {
    assert.strictEqual(string.match(regexp)[i], matches[i], 'S15.5.4.10_A2_T9 #3');
  }
  string = 'Boston, MA 02134';
  matches = ['02134', '02134', undefined];
  regexp = /([\d]{5})([-\ ]?[\d]{4})?$/;
  regexp.lastIndex = string.lastIndexOf('0');
  assert.strictEqual(string.match(regexp).length, 3, 'S15.5.4.10_A2_T10 #1');
  assert.strictEqual(string.match(regexp).index, string.lastIndexOf('0'), 'S15.5.4.10_A2_T10 #2');
  for (var i = 0, length = matches.length; i < length; ++i) {
    assert.strictEqual(string.match(regexp)[i], matches[i], 'S15.5.4.10_A2_T10 #3');
  }
  string = 'Boston, MA 02134';
  matches = ['02134', '02134', undefined];
  regexp = /([\d]{5})([-\ ]?[\d]{4})?$/;
  regexp.lastIndex = string.lastIndexOf('0') + 1;
  assert.strictEqual(string.match(regexp).length, 3, 'S15.5.4.10_A2_T11 #1');
  assert.strictEqual(string.match(regexp).index, string.lastIndexOf('0'), 'S15.5.4.10_A2_T11 #2');
  for (var i = 0, length = matches.length; i < length; ++i) {
    assert.strictEqual(string.match(regexp)[i], matches[i], 'S15.5.4.10_A2_T11 #3');
  }
  string = 'Boston, MA 02134';
  regexp = /([\d]{5})([-\ ]?[\d]{4})?$/g;
  assert.strictEqual(string.match(regexp).length, 1, 'S15.5.4.10_A2_T12 #1');
  assert.strictEqual(string.match(regexp)[0], '02134', 'S15.5.4.10_A2_T12 #2');
  regexp = /([\d]{5})([-\ ]?[\d]{4})?$/g;
  regexp.lastIndex = 0;
  string = 'Boston, MA 02134';
  assert.strictEqual(string.match(regexp).length, 1, 'S15.5.4.10_A2_T13 #1');
  assert.strictEqual(string.match(regexp)[0], '02134', 'S15.5.4.10_A2_T13 #2');
  string = 'Boston, MA 02134';
  regexp = /([\d]{5})([-\ ]?[\d]{4})?$/g;
  regexp.lastIndex = string.length;
  assert.strictEqual(string.match(regexp).length, 1, 'S15.5.4.10_A2_T14 #1');
  assert.strictEqual(string.match(regexp)[0], '02134', 'S15.5.4.10_A2_T14 #2');
  string = 'Boston, MA 02134';
  regexp = /([\d]{5})([-\ ]?[\d]{4})?$/g;
  regexp.lastIndex = string.lastIndexOf('0');
  assert.strictEqual(string.match(regexp).length, 1, 'S15.5.4.10_A2_T15 #1');
  assert.strictEqual(string.match(regexp)[0], '02134', 'S15.5.4.10_A2_T15 #2');
  string = 'Boston, MA 02134';
  regexp = /([\d]{5})([-\ ]?[\d]{4})?$/g;
  regexp.lastIndex = string.lastIndexOf('0') + 1;
  assert.strictEqual(string.match(regexp).length, 1, 'S15.5.4.10_A2_T16 #1');
  assert.strictEqual(string.match(regexp)[0], '02134', 'S15.5.4.10_A2_T16 #2');
  regexp = /0./;
  number = 10203040506070809000;
  assert.strictEqual(''.match.call(number, regexp)[0], '02', 'S15.5.4.10_A2_T17 #1');
  assert.strictEqual(''.match.call(number, regexp).length, 1, 'S15.5.4.10_A2_T17 #2');
  assert.strictEqual(''.match.call(number, regexp).index, 1, 'S15.5.4.10_A2_T17 #3');
  assert.strictEqual(''.match.call(number, regexp).input, String(number), 'S15.5.4.10_A2_T17 #4');
  regexp = /0./;
  regexp.lastIndex = 0;
  number = 10203040506070809000;
  assert.strictEqual(''.match.call(number, regexp)[0], '02', 'S15.5.4.10_A2_T18 #1');
  assert.strictEqual(''.match.call(number, regexp).length, 1, 'S15.5.4.10_A2_T18 #2');
  assert.strictEqual(''.match.call(number, regexp).index, 1, 'S15.5.4.10_A2_T18 #3');
  assert.strictEqual(''.match.call(number, regexp).input, String(number), 'S15.5.4.10_A2_T18 #4');
});

test('RegExp#@@match', function (assert) {
  assert.isFunction(/./[Symbol.match]);
  assert.arity(/./[Symbol.match], 1);
  var string = 'Boston, MA 02134';
  var matches = ['02134', '02134', undefined];
  assert.strictEqual(/([\d]{5})([-\ ]?[\d]{4})?$/[Symbol.match](string).length, 3);
  assert.strictEqual(/([\d]{5})([-\ ]?[\d]{4})?$/[Symbol.match](string).index, string.lastIndexOf('0'));
  for (var i = 0, length = matches.length; i < length; ++i) {
    assert.strictEqual(/([\d]{5})([-\ ]?[\d]{4})?$/[Symbol.match](string)[i], matches[i]);
  }
});

test('@@match logic', function (assert) {
  var string = STRICT ? 'string' : Object('string');
  var number = STRICT ? 42 : Object(42);
  var object = {};
  object[Symbol.match] = function (it) {
    return { value: it };
  };
  assert.strictEqual(string.match(object).value, string);
  assert.strictEqual(''.match.call(number, object).value, number);
  var regexp = /./;
  regexp[Symbol.match] = function (it) {
    return { value: it };
  };
  assert.strictEqual(string.match(regexp).value, string);
  assert.strictEqual(''.match.call(number, regexp).value, number);
});
