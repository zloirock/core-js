import { GLOBAL, NATIVE, STRICT } from '../helpers/constants';

const Symbol = GLOBAL.Symbol || {};

QUnit.test('String#replace regression', assert => {
  assert.isFunction(''.replace);
  assert.arity(''.replace, 2);
  assert.name(''.replace, 'replace');
  assert.looksNative(''.replace);
  assert.nonEnumerable(String.prototype, 'replace');
  let instance = Object(true);
  instance.replace = String.prototype.replace;
  assert.strictEqual(instance.replace(true, 1), '1', 'S15.5.4.11_A1_T1');
  instance = Object(false);
  instance.replace = String.prototype.replace;
  assert.strictEqual(instance.replace(false, undefined), 'undefined', 'S15.5.4.11_A1_T2');
  assert.strictEqual('gnulluna'.replace(null, (a1, a2) => `${ a2 }`), 'g1una', 'S15.5.4.11_A1_T4');
  assert.strictEqual('gnulluna'.replace(null, () => { /* empty */ }), 'gundefineduna', 'S15.5.4.11_A1_T5');
  assert.strictEqual(Object('undefined').replace(undefined, (a1, a2) => a2 + 42), '42', 'S15.5.4.11_A1_T6');
  assert.strictEqual('undefined'.replace('e', undefined), 'undundefinedfined', 'S15.5.4.11_A1_T7');
  assert.strictEqual(String({
    toString() { /* empty */ },
  }).replace(/e/g, undefined), 'undundefinedfinundefinedd', 'S15.5.4.11_A1_T8');
  assert.strictEqual(new String({
    valueOf() { /* empty */ },
    toString: undefined,
  }).replace(function () { /* empty */ }(), (a1, a2, a3) => a1 + a2 + a3), 'undefined0undefined', 'S15.5.4.11_A1_T9');
  assert.strictEqual('ABB\u0041BABAB'.replace({
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
      assert.ok(false, 'S15.5.4.11_A1_T11 #1 lead to throwing exception');
    } catch (e) {
      assert.strictEqual(e.message, 'insearchValue', 'S15.5.4.11_A1_T11 #2');
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
      assert.ok(false, 'S15.5.4.11_A1_T12 #1 lead to throwing exception');
    } catch (e) {
      assert.strictEqual(e.message, 'insearchValue', 'S15.5.4.11_A1_T12 #2');
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
    assert.ok(false, 'S15.5.4.11_A1_T13 #1 lead to throwing exception');
  } catch (e) {
    assert.strictEqual(e.message, 'insearchValue', 'S15.5.4.11_A1_T13 #2');
  }
  assert.strictEqual('ABB\u0041BABAB\u0037\u0037BBAA'.replace(new RegExp('77'), 1), 'ABBABABAB\u0031BBAA', 'S15.5.4.11_A1_T14');
  instance = Object(1100.00777001);
  instance.replace = String.prototype.replace;
  try {
    instance.replace({
      toString() {
        return /77/;
      },
    }, 1);
    assert.ok(false, 'S15.5.4.11_A1_T15 #1 lead to throwing exception');
  } catch (e) {
    assert.ok(e instanceof TypeError, 'S15.5.4.11_A1_T15 #2');
  }
  instance = Object(1100.00777001);
  instance.replace = String.prototype.replace;
  try {
    instance.replace(/77/, {
      toString() {
        return (a1, a2) => `${ a2 }z`;
      },
    });
    assert.ok(false, 'S15.5.4.11_A1_T16 #1 lead to throwing exception');
  } catch (e) {
    assert.ok(e instanceof TypeError, 'S15.5.4.11_A1_T16 #2');
  }
  assert.strictEqual('asdf'.replace(RegExp('', 'g'), '1'), '1a1s1d1f1', 'S15.5.4.11_A1_T17');
  assert.strictEqual('She sells seashells by the seashore.'.replace(/sh/g, 'sch'), 'She sells seaschells by the seaschore.', 'S15.5.4.11_A2_T1');
  assert.strictEqual('She sells seashells by the seashore.'.replace(/sh/g, '$$sch'), 'She sells sea$schells by the sea$schore.', 'S15.5.4.11_A2_T2');
  // eslint-disable-next-line max-len
  assert.strictEqual('She sells seashells by the seashore.'.replace(/sh/g, '$&sch'), 'She sells seashschells by the seashschore.', 'S15.5.4.11_A2_T3');
  // eslint-disable-next-line max-len
  assert.strictEqual('She sells seashells by the seashore.'.replace(/sh/g, '$`sch'), 'She sells seaShe sells seaschells by the seaShe sells seashells by the seaschore.', 'S15.5.4.11_A2_T4');
  // eslint-disable-next-line max-len
  assert.strictEqual('She sells seashells by the seashore.'.replace(/sh/g, "$'sch"), 'She sells seaells by the seashore.schells by the seaore.schore.', 'S15.5.4.11_A2_T5');
  assert.strictEqual('She sells seashells by the seashore.'.replace(/sh/, 'sch'), 'She sells seaschells by the seashore.', 'S15.5.4.11_A2_T6');
  assert.strictEqual('She sells seashells by the seashore.'.replace(/sh/, '$$sch'), 'She sells sea$schells by the seashore.', 'S15.5.4.11_A2_T7');
  assert.strictEqual('She sells seashells by the seashore.'.replace(/sh/, '$&sch'), 'She sells seashschells by the seashore.', 'S15.5.4.11_A2_T8');
  // eslint-disable-next-line max-len
  assert.strictEqual('She sells seashells by the seashore.'.replace(/sh/, '$`sch'), 'She sells seaShe sells seaschells by the seashore.', 'S15.5.4.11_A2_T9');
  // eslint-disable-next-line max-len
  assert.strictEqual('She sells seashells by the seashore.'.replace(/sh/, "$'sch"), 'She sells seaells by the seashore.schells by the seashore.', 'S15.5.4.11_A2_T10');
  assert.strictEqual('uid=31'.replace(/(uid=)(\d+)/, '$1115'), 'uid=115', 'S15.5.4.11_A3_T1');
  assert.strictEqual('uid=31'.replace(/(uid=)(\d+)/, '$11A15'), 'uid=1A15', 'S15.5.4.11_A3_T3');
  assert.strictEqual('abc12 def34'.replace(/([a-z]+)([0-9]+)/, (a, b, c) => c + b), '12abc def34', 'S15.5.4.11_A4_T1');
  assert.strictEqual('aaaaaaaaaa,aaaaaaaaaaaaaaa'.replace(/^(a+)\1*,\1+$/, '$1'), 'aaaaa', 'S15.5.4.11_A5_T1');
});

QUnit.test('RegExp#@@replace', assert => {
  assert.isFunction(/./[Symbol.replace]);
  assert.arity(/./[Symbol.replace], 2);
  assert.strictEqual(/([a-z]+)([0-9]+)/[Symbol.replace]('abc12 def34', (a, b, c) => c + b), '12abc def34');
});

QUnit.test('@@replace logic', assert => {
  const string = STRICT ? 'string' : Object('string');
  const number = STRICT ? 42 : Object(42);
  const object = {};
  object[Symbol.replace] = function (a, b) {
    return { a, b };
  };
  assert.strictEqual(string.replace(object, 42).a, string);
  assert.strictEqual(string.replace(object, 42).b, 42);
  assert.strictEqual(''.replace.call(number, object, 42).a, number);
  assert.strictEqual(''.replace.call(number, object, 42).b, 42);
  const regexp = /./;
  regexp[Symbol.replace] = function (a, b) {
    return { a, b };
  };
  assert.strictEqual(string.replace(regexp, 42).a, string);
  assert.strictEqual(string.replace(regexp, 42).b, 42);
  assert.strictEqual(''.replace.call(number, regexp, 42).a, number);
  assert.strictEqual(''.replace.call(number, regexp, 42).b, 42);
});
