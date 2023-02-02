// Some tests from Test262 project and governed by the BSD license.
// Copyright (c) 2012 Ecma International.  All rights reserved.
import { DESCRIPTORS, GLOBAL } from '../helpers/constants';

if (GLOBAL.JSON?.stringify) {
  QUnit.test('JSON.stringify', assert => {
    const { stringify } = JSON;
    const { defineProperty } = Object;

    assert.isFunction(stringify);
    assert.arity(stringify, 3);
    assert.name(stringify, 'stringify');
    assert.looksNative(stringify);

    assert.same(stringify({ a: 1, b: 2 }, []), '{}', 'replacer-array-empty-1');
    assert.same(stringify({ a: 1, b: { c: 2 } }, []), '{}', 'replacer-array-empty-2');
    assert.same(stringify([1, { a: 2 }], []), '[1,{}]', 'replacer-array-empty-3');

    const num = new Number(10);
    num.toString = () => 'toString';
    num.valueOf = () => { throw EvalError('should not be called'); };
    assert.same(JSON.stringify({
      10: 1,
      toString: 2,
      valueOf: 3,
    }, [num]), '{"toString":2}', 'replacer-array-number-object');

    const obj1 = {
      0: 0,
      1: 1,
      '-4': 2,
      0.3: 3,
      '-Infinity': 4,
      NaN: 5,
    };
    assert.same(stringify(obj1, [
      -0,
      1,
      -4,
      0.3,
      -Infinity,
      NaN,
    ]), stringify(obj1), 'replacer-array-number');

    const str = new String('str');
    str.toString = () => 'toString';
    str.valueOf = () => { throw EvalError('should not be called'); };
    assert.same(stringify({
      str: 1,
      toString: 2,
      valueOf: 3,
    }, [str]), '{"toString":2}', 'replacer-array-string-object');

    assert.same(stringify({ undefined: 1 }, [undefined]), '{}', 'replacer-array-undefined-1');
    // eslint-disable-next-line no-sparse-arrays -- testing
    assert.same(stringify({ key: 1, undefined: 2 }, [,,,]), '{}', 'replacer-array-undefined-2');
    const sparse = Array(3);
    sparse[1] = 'key';
    assert.same(stringify({ undefined: 1, key: 2 }, sparse), '{"key":2}', 'replacer-array-undefined-3');

    assert.throws(() => stringify({}, () => { throw EvalError('should not be called'); }), EvalError, 'replacer-function-abrupt');

    const calls = [];
    const b1 = [1, 2];
    const b2 = { c1: true, c2: false };
    const a1 = {
      b1,
      b2: {
        toJSON() { return b2; },
      },
    };
    const obj2 = { a1, a2: 'a2' };
    assert.same(stringify(obj2, function (key, value) {
      if (key !== '') calls.push([this, key, value]);
      return value;
    }), stringify(obj2), 'replacer-function-arguments-1');
    assert.arrayEqual(calls[0], [obj2, 'a1', a1], 'replacer-function-arguments-2');
    assert.arrayEqual(calls[1], [a1, 'b1', b1], 'replacer-function-arguments-3');
    assert.arrayEqual(calls[2], [b1, '0', 1], 'replacer-function-arguments-4');
    assert.arrayEqual(calls[3], [b1, '1', 2], 'replacer-function-arguments-5');
    assert.arrayEqual(calls[4], [a1, 'b2', b2], 'replacer-function-arguments-6');
    assert.arrayEqual(calls[5], [b2, 'c1', true], 'replacer-function-arguments-7');
    assert.arrayEqual(calls[6], [b2, 'c2', false], 'replacer-function-arguments-8');
    assert.arrayEqual(calls[7], [obj2, 'a2', 'a2'], 'replacer-function-arguments-9');

    const circular = [{}];
    assert.throws(() => stringify(circular, () => circular), TypeError, 'replacer-function-array-circular');

    const direct = { prop: {} };
    assert.throws(() => stringify(direct, () => direct), TypeError, 'replacer-function-object-circular-1');
    const indirect = { p1: { p2: {} } };
    assert.throws(() => stringify(indirect, (key, value) => key === 'p2' ? indirect : value), TypeError, 'replacer-function-object-circular-2');

    assert.same(stringify(1, () => { /* empty */ }), undefined, 'replacer-function-result-undefined-1');
    assert.same(stringify([1], () => { /* empty */ }), undefined, 'replacer-function-result-undefined-2');
    assert.same(stringify({ prop: 1 }, () => { /* empty */ }), undefined, 'replacer-function-result-undefined-3');
    assert.same(stringify([1], (key, value) => value === 1 ? undefined : value), '[null]', 'replacer-function-result-undefined-4');
    assert.same(stringify({ prop: 1 }, (key, value) => value === 1 ? undefined : value), '{}', 'replacer-function-result-undefined-5');
    assert.same(stringify({ a: { b: [1] } }, (key, value) => value === 1 ? undefined : value), '{"a":{"b":[null]}}', 'replacer-function-result-undefined-6');

    assert.same(stringify(null, (key, value) => {
      assert.same(value, null);
      switch (key) {
        case '': return { a1: null, a2: null };
        case 'a1': return { b1: null, b2: null };
        case 'a2': return 'a2';
        case 'b1': return [null, null];
        case 'b2': return { c1: null, c2: null };
        case '0': return 1;
        case '1': return 2;
        case 'c1': return true;
        case 'c2': return false;
      } throw new EvalError('unreachable');
    }), stringify({
      a1: {
        b1: [1, 2],
        b2: {
          c1: true,
          c2: false,
        },
      },
      a2: 'a2',
    }), 'replacer-function-result');

    assert.same(stringify({
      toJSON() { return 'toJSON'; },
    }, (_key, value) => `${ value }|replacer`), '"toJSON|replacer"', 'replacer-function-tojson-1');

    assert.same(stringify({
      toJSON() { return { calls: 'toJSON' }; },
    }, (_key, value) => {
      if (value && value.calls) value.calls += '|replacer';
      return value;
    }), '{"calls":"toJSON|replacer"}', 'replacer-function-tojson-2');

    const obj4 = { key: [1] };
    const json1 = '{"key":[1]}';
    assert.same(stringify(obj4, {}), json1, 'replacer-wrong-type-1');
    assert.same(stringify(obj4, new String('str')), json1, 'replacer-wrong-type-2');
    assert.same(stringify(obj4, new Number(6.1)), json1, 'replacer-wrong-type-3');
    assert.same(stringify(obj4, null), json1, 'replacer-wrong-type-4');
    assert.same(stringify(obj4, ''), json1, 'replacer-wrong-type-5');
    assert.same(stringify(obj4, 0), json1, 'replacer-wrong-type-6');
    assert.same(stringify(obj4, Symbol()), json1, 'replacer-wrong-type-7');
    assert.same(stringify(obj4, true), json1, 'replacer-wrong-type-8');

    const obj5 = {
      a1: {
        b1: [1, 2, 3, 4],
        b2: {
          c1: 1,
          c2: 2,
        },
      },
      a2: 'a2',
    };
    assert.same(stringify(obj5, null, -1.99999), stringify(obj5, null, -1), 'space-number-float-1');
    assert.same(stringify(obj5, null, new Number(5.11111)), stringify(obj5, null, 5), 'space-number-float-2');
    assert.same(stringify(obj5, null, 6.99999), stringify(obj5, null, 6), 'space-number-float-3');

    if (DESCRIPTORS) {
      // This getter will be triggered during enumeration, but the property it adds should not be enumerated.
      const o = defineProperty({
        p1: 'p1',
        p2: 'p2',
        p3: 'p3',
      }, 'add', {
        enumerable: true,
        get() {
          o.extra = 'extra';
          return 'add';
        },
      });
      o.p4 = 'p4';
      o[2] = '2';
      o[0] = '0';
      o[1] = '1';
      delete o.p1;
      delete o.p3;
      o.p1 = 'p1';
      assert.same(stringify(o), '{"0":"0","1":"1","2":"2","p2":"p2","add":"add","p4":"p4","p1":"p1"}', 'property-order');

      let getCalls = 0;
      assert.same(stringify(defineProperty({}, 'key', {
        enumerable: true,
        get() {
          getCalls += 1;
          return true;
        },
      }), ['key', 'key']), '{"key":true}', 'replacer-array-duplicates-1');
      assert.same(getCalls, 1, 'replacer-array-duplicates-2');

      /* old WebKit bug - however, fixing of this is not in priority
      const obj3 = defineProperty({}, 'a', {
        enumerable: true,
        get() {
          delete this.b;
          return 1;
        },
      });
      obj3.b = 2;
      assert.same(stringify(obj3, (key, value) => {
        if (key === 'b') {
          assert.same(value, undefined, 'replacer-function-object-deleted-property-1');
          return '<replaced>';
        } return value;
      }), '{"a":1,"b":"<replaced>"}', 'replacer-function-object-deleted-property-2');
      */
    }
  });

  QUnit.test('Symbols & JSON.stringify', assert => {
    const { stringify } = JSON;

    assert.same(stringify([
      1,
      Symbol('foo'),
      false,
      Symbol('bar'),
      {},
    ]), '[1,null,false,null,{}]', 'array value');
    assert.same(stringify({
      symbol: Symbol('symbol'),
    }), '{}', 'object value');
    if (DESCRIPTORS) {
      const object = { bar: 2 };
      object[Symbol('symbol')] = 1;
      assert.same(stringify(object), '{"bar":2}', 'object key');
    }
    assert.same(stringify(Symbol('symbol')), undefined, 'symbol value');
    if (typeof Symbol() == 'symbol') {
      assert.same(stringify(Object(Symbol('symbol'))), '{}', 'boxed symbol');
    }
    assert.same(stringify(undefined, () => 42), '42', 'replacer works with top-level undefined');
  });

  QUnit.test('Well‑formed JSON.stringify', assert => {
    const { stringify } = JSON;

    assert.same(stringify({ foo: 'bar' }), '{"foo":"bar"}', 'basic');
    assert.same(stringify('\uDEAD'), '"\\udead"', 'r1');
    assert.same(stringify('\uDF06\uD834'), '"\\udf06\\ud834"', 'r2');
    assert.same(stringify('\uDF06ab\uD834'), '"\\udf06ab\\ud834"', 'r3');
    assert.same(stringify('𠮷'), '"𠮷"', 'r4');
    assert.same(stringify('\uD834\uDF06'), '"𝌆"', 'r5');
    assert.same(stringify('\uD834\uD834\uDF06'), '"\\ud834𝌆"', 'r6');
    assert.same(stringify('\uD834\uDF06\uDF06'), '"𝌆\\udf06"', 'r7');
    assert.same(stringify({ '𠮷': ['\uDF06\uD834'] }), '{"𠮷":["\\udf06\\ud834"]}', 'r8');
  });
}
