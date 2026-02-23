/* eslint-disable prefer-regex-literals, regexp/no-unused-capturing-group, sonarjs/slow-regex, unicorn/prefer-string-replace-all -- required for testing */
import { GLOBAL, NATIVE, STRICT } from '../helpers/constants.js';
import { patchRegExp$exec } from '../helpers/helpers.js';

const Symbol = GLOBAL.Symbol || {};

const run = assert => {
  assert.isFunction(''.replace);
  assert.arity(''.replace, 2);
  assert.name(''.replace, 'replace');
  assert.looksNative(''.replace);
  assert.nonEnumerable(String.prototype, 'replace');
  let instance = Object(true);
  instance.replace = String.prototype.replace;
  assert.same(instance.replace(true, 1), '1', 'S15.5.4.11_A1_T1');
  instance = Object(false);
  instance.replace = String.prototype.replace;
  assert.same(instance.replace(false, undefined), 'undefined', 'S15.5.4.11_A1_T2');
  assert.same('gnulluna'.replace(null, (a1, a2) => `${ a2 }`), 'g1una', 'S15.5.4.11_A1_T4');
  assert.same('gnulluna'.replace(null, () => { /* empty */ }), 'gundefineduna', 'S15.5.4.11_A1_T5');
  assert.same(Object('undefined').replace(undefined, (a1, a2) => a2 + 42), '42', 'S15.5.4.11_A1_T6');
  assert.same('undefined'.replace('e', undefined), 'undundefinedfined', 'S15.5.4.11_A1_T7');
  assert.same(String({
    toString() { /* empty */ },
  }).replace(/e/g, undefined), 'undundefinedfinundefinedd', 'S15.5.4.11_A1_T8');
  assert.same(new String({
    valueOf() { /* empty */ },
    toString: undefined,
  }).replace(function () { /* empty */ }(), (a1, a2, a3) => a1 + a2 + a3), 'undefined0undefined', 'S15.5.4.11_A1_T9');
  assert.same('ABB\u0041BABAB'.replace({
    toString() {
      return '\u0041B';
    },
  }, () => { /* empty */ }), 'undefinedBABABAB', 'S15.5.4.11_A1_T10');
  if (NATIVE) {
    try {
      'ABB\u0041BABAB'.replace({
        toString() {
          throw new Error('insearchValue');
        },
      }, {
        toString() {
          throw new Error('inreplaceValue');
        },
      });
      assert.avoid('S15.5.4.11_A1_T11 #1 lead to throwing exception');
    } catch (error) {
      assert.same(error.message, 'insearchValue', 'S15.5.4.11_A1_T11 #2');
    }
    try {
      Object('ABB\u0041BABAB').replace({
        toString() {
          return {};
        },
        valueOf() {
          throw new Error('insearchValue');
        },
      }, {
        toString() {
          throw new Error('inreplaceValue');
        },
      });
      assert.avoid('S15.5.4.11_A1_T12 #1 lead to throwing exception');
    } catch (error) {
      assert.same(error.message, 'insearchValue', 'S15.5.4.11_A1_T12 #2');
    }
  }
  try {
    'ABB\u0041BABAB\u0031BBAA'.replace({
      toString() {
        return {};
      },
      valueOf() {
        throw new Error('insearchValue');
      },
    }, {
      toString() {
        return 1;
      },
    });
    assert.avoid('S15.5.4.11_A1_T13 #1 lead to throwing exception');
  } catch (error) {
    assert.same(error.message, 'insearchValue', 'S15.5.4.11_A1_T13 #2');
  }
  assert.same('ABB\u0041BABAB\u0037\u0037BBAA'.replace(new RegExp('77'), 1), 'ABBABABAB\u0031BBAA', 'S15.5.4.11_A1_T14');
  instance = Object(1100.00777001);
  instance.replace = String.prototype.replace;
  try {
    instance.replace({
      toString() {
        return /77/;
      },
    }, 1);
    assert.avoid('S15.5.4.11_A1_T15 #1 lead to throwing exception');
  } catch (error) {
    assert.true(error instanceof TypeError, 'S15.5.4.11_A1_T15 #2');
  }
  instance = Object(1100.00777001);
  instance.replace = String.prototype.replace;
  try {
    instance.replace(/77/, {
      toString() {
        return (a1, a2) => `${ a2 }z`;
      },
    });
    assert.avoid('S15.5.4.11_A1_T16 #1 lead to throwing exception');
  } catch (error) {
    assert.true(error instanceof TypeError, 'S15.5.4.11_A1_T16 #2');
  }
  assert.same('asdf'.replace(RegExp('', 'g'), '1'), '1a1s1d1f1', 'S15.5.4.11_A1_T17');
  assert.same('She sells seashells by the seashore.'.replace(/sh/g, 'sch'), 'She sells seaschells by the seaschore.', 'S15.5.4.11_A2_T1');
  assert.same('She sells seashells by the seashore.'.replace(/sh/g, '$$sch'), 'She sells sea$schells by the sea$schore.', 'S15.5.4.11_A2_T2');
  assert.same('She sells seashells by the seashore.'.replace(/sh/g, '$&sch'), 'She sells seashschells by the seashschore.', 'S15.5.4.11_A2_T3');
  assert.same('She sells seashells by the seashore.'.replace(/sh/g, '$`sch'), 'She sells seaShe sells seaschells by the seaShe sells seashells by the seaschore.', 'S15.5.4.11_A2_T4');
  assert.same('She sells seashells by the seashore.'.replace(/sh/g, "$'sch"), 'She sells seaells by the seashore.schells by the seaore.schore.', 'S15.5.4.11_A2_T5');
  assert.same('She sells seashells by the seashore.'.replace(/sh/, 'sch'), 'She sells seaschells by the seashore.', 'S15.5.4.11_A2_T6');
  assert.same('She sells seashells by the seashore.'.replace(/sh/, '$$sch'), 'She sells sea$schells by the seashore.', 'S15.5.4.11_A2_T7');
  assert.same('She sells seashells by the seashore.'.replace(/sh/, '$&sch'), 'She sells seashschells by the seashore.', 'S15.5.4.11_A2_T8');
  assert.same('She sells seashells by the seashore.'.replace(/sh/, '$`sch'), 'She sells seaShe sells seaschells by the seashore.', 'S15.5.4.11_A2_T9');
  assert.same('She sells seashells by the seashore.'.replace(/sh/, "$'sch"), 'She sells seaells by the seashore.schells by the seashore.', 'S15.5.4.11_A2_T10');
  assert.same('uid=31'.replace(/(uid=)(\d+)/, '$1115'), 'uid=115', 'S15.5.4.11_A3_T1');
  assert.same('uid=31'.replace(/(uid=)(\d+)/, '$11A15'), 'uid=1A15', 'S15.5.4.11_A3_T3');
  assert.same('abc12 def34'.replace(/([a-z]+)(\d+)/, (a, b, c) => c + b), '12abc def34', 'S15.5.4.11_A4_T1');
  // eslint-disable-next-line regexp/optimal-quantifier-concatenation -- required for testing
  assert.same('aaaaaaaaaa,aaaaaaaaaaaaaaa'.replace(/^(a+)\1*,\1+$/, '$1'), 'aaaaa', 'S15.5.4.11_A5_T1');

  // https://github.com/zloirock/core-js/issues/471
  // eslint-disable-next-line regexp/no-useless-dollar-replacements, regexp/strict -- required for testing
  assert.same('{price} Retail'.replace(/{price}/g, '$25.00'), '$25.00 Retail');
  // eslint-disable-next-line regexp/prefer-escape-replacement-dollar-char -- required for testing
  assert.same('a'.replace(/(.)/, '$0'), '$0');

  assert.throws(() => ''.replace.call(Symbol('replace test'), /./, ''), 'throws on symbol context');
};

QUnit.test('String#replace regression', run);

QUnit.test('RegExp#@@replace appearance', assert => {
  const replace = /./[Symbol.replace];
  assert.isFunction(replace);
  // assert.name(replace, '[Symbol.replace]');
  assert.arity(replace, 2);
  assert.looksNative(replace);
  assert.nonEnumerable(RegExp.prototype, Symbol.replace);
});

QUnit.test('RegExp#@@replace basic behavior', assert => {
  assert.same(/([a-z]+)(\d+)/[Symbol.replace]('abc12 def34', (a, b, c) => c + b), '12abc def34');
});

QUnit.test('String#replace delegates to @@replace', assert => {
  const string = STRICT ? 'string' : Object('string');
  const number = STRICT ? 42 : Object(42);
  const object = {};
  object[Symbol.replace] = function (a, b) {
    return { a, b };
  };
  assert.same(string.replace(object, 42).a, string);
  assert.same(string.replace(object, 42).b, 42);
  assert.same(''.replace.call(number, object, 42).a, number);
  assert.same(''.replace.call(number, object, 42).b, 42);
  const regexp = /./;
  regexp[Symbol.replace] = function (a, b) {
    return { a, b };
  };
  assert.same(string.replace(regexp, 42).a, string);
  assert.same(string.replace(regexp, 42).b, 42);
  assert.same(''.replace.call(number, regexp, 42).a, number);
  assert.same(''.replace.call(number, regexp, 42).b, 42);
});

QUnit.test('RegExp#@@replace delegates to exec', assert => {
  const exec = function (...args) {
    execCalled = true;
    return /./.exec.apply(this, args);
  };

  let execCalled = false;
  let re = /[ac]/;
  re.exec = exec;
  assert.deepEqual(re[Symbol.replace]('abc', 'f'), 'fbc');
  assert.true(execCalled);
  assert.same(re.lastIndex, 0);

  execCalled = false;
  re = /[ac]/g;
  re.exec = exec;
  assert.deepEqual(re[Symbol.replace]('abc', 'f'), 'fbf');
  assert.true(execCalled);
  assert.same(re.lastIndex, 0);

  re = /a/;
  // Not a function, should be ignored
  re.exec = 3;
  assert.deepEqual(re[Symbol.replace]('abc', 'f'), 'fbc');

  re = /a/;
  // Does not return an object, should throw
  re.exec = () => 3;
  assert.throws(() => re[Symbol.replace]('abc', 'f'));
});

QUnit.test('RegExp#@@replace correctly handles substitutions', assert => {
  const re = /./;
  re.exec = function () {
    const result = ['23', '7'];
    result.groups = { '!!!': '7' };
    result.index = 1;
    return result;
  };
  // eslint-disable-next-line regexp/no-useless-dollar-replacements -- false positive
  assert.same('1234'.replace(re, '$1'), '174');
  // eslint-disable-next-line regexp/no-useless-dollar-replacements -- required for testing
  assert.same('1234'.replace(re, '$<!!!>'), '174');
  assert.same('1234'.replace(re, '$`'), '114');
  assert.same('1234'.replace(re, "$'"), '144');
  assert.same('1234'.replace(re, '$$'), '1$4');
  assert.same('1234'.replace(re, '$&'), '1234');
  // eslint-disable-next-line regexp/prefer-escape-replacement-dollar-char -- required for testing
  assert.same('1234'.replace(re, '$x'), '1$x4');

  let args;
  assert.same('1234'.replace(re, (...$args) => {
    args = $args;
    return 'x';
  }), '1x4');
  assert.deepEqual(args, ['23', '7', 1, '1234', { '!!!': '7' }]);
});

QUnit.test('RegExp#@@replace implementation', patchRegExp$exec(run));

QUnit.test('RegExp#@@replace global+unicode empty match at string end', assert => {
  // eslint-disable-next-line regexp/no-empty-group -- testing
  assert.same('abc'.replace(/(?:)/gu, '-'), '-a-b-c-', 'does not infinite loop on global+unicode empty match');
});
