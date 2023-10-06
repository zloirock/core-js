// Some tests adopted from Test262 project and governed by the BSD license.
// Copyright (c) 2012 Ecma International. All rights reserved.
/* eslint-disable es/no-bigint,unicorn/no-hex-escape -- testing */
import { GLOBAL } from '../helpers/constants.js';
import stringify from 'core-js-pure/es/json/stringify';
import Symbol from 'core-js-pure/es/symbol';
import defineProperty from 'core-js-pure/es/object/define-property';
import keys from 'core-js-pure/es/object/keys';
import values from 'core-js-pure/es/object/values';

if (GLOBAL.JSON?.stringify) {
  QUnit.test('JSON.stringify', assert => {
    assert.isFunction(stringify);
    assert.arity(stringify, 3);
    assert.name(stringify, 'stringify');

    assert.same(stringify({ a: 1, b: 2 }, []), '{}', 'replacer-array-empty-1');
    assert.same(stringify({ a: 1, b: { c: 2 } }, []), '{}', 'replacer-array-empty-2');
    assert.same(stringify([1, { a: 2 }], []), '[1,{}]', 'replacer-array-empty-3');

    const num1 = new Number(10);
    num1.toString = () => 'toString';
    num1.valueOf = () => { throw new EvalError('should not be called'); };
    assert.same(stringify({
      10: 1,
      toString: 2,
      valueOf: 3,
    }, [num1]), '{"toString":2}', 'replacer-array-number-object');

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

    const str1 = new String('str');
    str1.toString = () => 'toString';
    str1.valueOf = () => { throw new EvalError('should not be called'); };
    assert.same(stringify({
      str: 1,
      toString: 2,
      valueOf: 3,
    }, [str1]), '{"toString":2}', 'replacer-array-string-object');

    assert.same(stringify({ undefined: 1 }, [undefined]), '{}', 'replacer-array-undefined-1');
    // eslint-disable-next-line no-sparse-arrays -- testing
    assert.same(stringify({ key: 1, undefined: 2 }, [,,,]), '{}', 'replacer-array-undefined-2');
    const sparse = Array(3);
    sparse[1] = 'key';
    assert.same(stringify({ undefined: 1, key: 2 }, sparse), '{"key":2}', 'replacer-array-undefined-3');

    assert.throws(() => stringify({}, () => { throw new EvalError('should not be called'); }), EvalError, 'replacer-function-abrupt');

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

    const circular1 = [{}];
    assert.throws(() => stringify(circular1, () => circular1), TypeError, 'replacer-function-array-circular');

    const direct1 = { prop: {} };
    assert.throws(() => stringify(direct1, () => direct1), TypeError, 'replacer-function-object-circular-1');
    const indirect1 = { p1: { p2: {} } };
    assert.throws(() => stringify(indirect1, (key, value) => key === 'p2' ? indirect1 : value), TypeError, 'replacer-function-object-circular-2');

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
    assert.same(stringify(obj4, Symbol('stringify replacer test')), json1, 'replacer-wrong-type-7');
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

    assert.same(stringify(obj5, null, new Number(1)), stringify(obj5, null, 1), 'space-number-object-1');
    const num2 = new Number(1);
    num2.toString = () => { throw new EvalError('should not be called'); };
    num2.valueOf = () => 3;
    assert.same(stringify(obj5, null, num2), stringify(obj5, null, 3), 'space-number-object-2');
    const abrupt1 = new Number(4);
    abrupt1.toString = () => { throw new EvalError('t262'); };
    abrupt1.valueOf = () => { throw new EvalError('t262'); };
    assert.throws(() => stringify(obj5, null, abrupt1), EvalError, 'space-number-object-3');

    assert.same(stringify(obj5, null, new Number(-5)), stringify(obj5, null, 0), 'space-number-range-1');
    assert.same(stringify(obj5, null, 10), stringify(obj5, null, 100), 'space-number-range-2');

    assert.same(stringify(obj5, null, 0), stringify(obj5, null, ''), 'space-number-1');
    assert.same(stringify(obj5, null, 4), stringify(obj5, null, '    '), 'space-number-2');

    assert.same(stringify(obj5, null, new String('xxx')), stringify(obj5, null, 'xxx'), 'space-string-object-1');
    const str2 = new String('xxx');
    str2.toString = () => '---';
    str2.valueOf = () => { throw new EvalError('should not be called'); };
    assert.same(stringify(obj5, null, str2), stringify(obj5, null, '---'), 'space-string-object-2');
    const abrupt2 = new String('xxx');
    abrupt2.toString = () => { throw new EvalError('t262'); };
    abrupt2.valueOf = () => { throw new EvalError('t262'); };
    assert.throws(() => stringify(obj5, null, abrupt2), EvalError, 'space-string-object-3');

    assert.same(stringify(obj5, null, '0123456789xxxxxxxxx'), stringify(obj5, null, '0123456789'), 'space-string-range');

    assert.same(stringify(obj5, null, ''), stringify(obj5), 'space-string-1');
    assert.same(stringify(obj5, null, '  '), `{
  "a1": {
    "b1": [
      1,
      2,
      3,
      4
    ],
    "b2": {
      "c1": 1,
      "c2": 2
    }
  },
  "a2": "a2"
}`, 'space-string-2');

    assert.same(stringify(obj5), stringify(obj5, null, null), 'space-wrong-type-1');
    assert.same(stringify(obj5), stringify(obj5, null, true), 'space-wrong-type-2');
    assert.same(stringify(obj5), stringify(obj5, null, new Boolean(false)), 'space-wrong-type-3');
    assert.same(stringify(obj5), stringify(obj5, null, Symbol('stringify space test')), 'space-wrong-type-4');
    assert.same(stringify(obj5), stringify(obj5, null, {}), 'space-wrong-type-5');

    const direct2 = [];
    direct2.push(direct2);
    assert.throws(() => stringify(direct2), TypeError, 'value-array-circular-1');
    const indirect2 = [];
    indirect2.push([[indirect2]]);
    assert.throws(() => stringify(indirect2), TypeError, 'value-array-circular-2');

    if (typeof BigInt == 'function') {
      assert.same(stringify(BigInt(0), (k, v) => typeof v === 'bigint' ? 'bigint' : v), '"bigint"', 'value-bigint-replacer-1');
      assert.same(stringify({ x: BigInt(0) }, (k, v) => typeof v === 'bigint' ? 'bigint' : v), '{"x":"bigint"}', 'value-bigint-replacer-2');
      assert.throws(() => stringify(BigInt(0)), TypeError, 'value-bigint-1');
      assert.throws(() => stringify(Object(BigInt(0))), TypeError, 'value-bigint-2');
      assert.throws(() => stringify({ x: BigInt(0) }), TypeError, 'value-bigint-3');
    }

    assert.same(stringify(new Boolean(true)), 'true', 'value-boolean-object-1');
    assert.same(stringify({
      toJSON() {
        return { key: new Boolean(false) };
      },
    }), '{"key":false}', 'value-boolean-object-2');
    assert.same(stringify([1], (k, v) => v === 1 ? new Boolean(true) : v), '[true]', 'value-boolean-object-3');

    assert.same(stringify(() => { /* empty */ }), undefined, 'value-function-1');
    assert.same(stringify([() => { /* empty */ }]), '[null]', 'value-function-2');
    assert.same(stringify({ key() { /* empty */ } }), '{}', 'value-function-3');

    assert.same(stringify(-0), '0', 'value-number-negative-zero-1');
    assert.same(stringify(['-0', 0, -0]), '["-0",0,0]', 'value-number-negative-zero-2');
    assert.same(stringify({ key: -0 }), '{"key":0}', 'value-number-negative-zero-3');

    assert.same(stringify(Infinity), 'null', 'value-number-non-finite-1');
    assert.same(stringify({ key: -Infinity }), '{"key":null}', 'value-number-non-finite-2');
    assert.same(stringify([NaN]), '[null]', 'value-number-non-finite-3');

    assert.same(stringify(new Number(8.5)), '8.5', 'value-number-object-1');
    assert.same(stringify(['str'], (key, value) => {
      if (value === 'str') {
        const num = new Number(42);
        num.toString = () => { throw new EvalError('should not be called'); };
        num.valueOf = () => 2;
        return num;
      } return value;
    }), '[2]', 'value-number-object-2');
    assert.throws(() => stringify({
      key: {
        toJSON() {
          const num = new Number(3.14);
          num.toString = () => { throw new EvalError('t262'); };
          num.valueOf = () => { throw new EvalError('t262'); };
          return num;
        },
      },
    }), EvalError, 'value-number-object-3');

    const direct3 = { prop: null };
    direct3.prop = direct3;
    assert.throws(() => stringify(direct3), TypeError, 'value-object-circular-1');
    const indirect3 = { p1: { p2: {} } };
    indirect3.p1.p2.p3 = indirect3;
    assert.throws(() => stringify(indirect3), TypeError, 'value-object-circular-2');

    assert.same(stringify(null), 'null', 'null');
    assert.same(stringify(true), 'true', 'true');
    assert.same(stringify(false), 'false', 'false');
    assert.same(stringify('str'), '"str"', '"str"');
    assert.same(stringify(123), '123', '123');
    assert.same(stringify(undefined), undefined, 'undefined');

    const charToJson = {
      '"': '\\"',
      '\\': '\\\\',
      '\x00': '\\u0000',
      '\x01': '\\u0001',
      '\x02': '\\u0002',
      '\x03': '\\u0003',
      '\x04': '\\u0004',
      '\x05': '\\u0005',
      '\x06': '\\u0006',
      '\x07': '\\u0007',
      '\x08': '\\b',
      '\x09': '\\t',
      '\x0A': '\\n',
      '\x0B': '\\u000b',
      '\x0C': '\\f',
      '\x0D': '\\r',
      '\x0E': '\\u000e',
      '\x0F': '\\u000f',
      '\x10': '\\u0010',
      '\x11': '\\u0011',
      '\x12': '\\u0012',
      '\x13': '\\u0013',
      '\x14': '\\u0014',
      '\x15': '\\u0015',
      '\x16': '\\u0016',
      '\x17': '\\u0017',
      '\x18': '\\u0018',
      '\x19': '\\u0019',
      '\x1A': '\\u001a',
      '\x1B': '\\u001b',
      '\x1C': '\\u001c',
      '\x1D': '\\u001d',
      '\x1E': '\\u001e',
      '\x1F': '\\u001f',
    };
    const chars = keys(charToJson).join('');
    const charsReversed = keys(charToJson).reverse().join('');
    const jsonChars = values(charToJson).join('');
    const jsonCharsReversed = values(charToJson).reverse().join('');
    const json = stringify({ [`name${ chars }${ charsReversed }`]: `${ charsReversed }${ chars }value` });
    for (const chr in charToJson) {
      const count = json.split(charToJson[chr]).length - 1;
      assert.same(count, 4, `Every ASCII 0x${ chr.charCodeAt(0).toString(16) } serializes to ${ charToJson[chr] }`);
    }
    assert.same(
      json,
      `{"name${ jsonChars }${ jsonCharsReversed }":"${ jsonCharsReversed }${ jsonChars }value"}`,
      'JSON.stringify(objectUsingControlCharacters)',
    );

    assert.same(stringify('\uD834'), '"\\ud834"', 'JSON.stringify("\\uD834")');
    assert.same(stringify('\uDF06'), '"\\udf06"', 'JSON.stringify("\\uDF06")');
    assert.same(stringify('\uD834\uDF06'), '"𝌆"', 'JSON.stringify("\\uD834\\uDF06")');
    assert.same(stringify('\uD834\uD834\uDF06\uD834'), '"\\ud834𝌆\\ud834"', 'JSON.stringify("\\uD834\\uD834\\uDF06\\uD834")');
    assert.same(stringify('\uD834\uD834\uDF06\uDF06'), '"\\ud834𝌆\\udf06"', 'JSON.stringify("\\uD834\\uD834\\uDF06\\uDF06")');
    assert.same(stringify('\uDF06\uD834\uDF06\uD834'), '"\\udf06𝌆\\ud834"', 'JSON.stringify("\\uDF06\\uD834\\uDF06\\uD834")');
    assert.same(stringify('\uDF06\uD834\uDF06\uDF06'), '"\\udf06𝌆\\udf06"', 'JSON.stringify("\\uDF06\\uD834\\uDF06\\uDF06")');
    assert.same(stringify('\uDF06\uD834'), '"\\udf06\\ud834"', 'JSON.stringify("\\uDF06\\uD834")');
    assert.same(stringify('\uD834\uDF06\uD834\uD834'), '"𝌆\\ud834\\ud834"', 'JSON.stringify("\\uD834\\uDF06\\uD834\\uD834")');
    assert.same(stringify('\uD834\uDF06\uD834\uDF06'), '"𝌆𝌆"', 'JSON.stringify("\\uD834\\uDF06\\uD834\\uDF06")');
    assert.same(stringify('\uDF06\uDF06\uD834\uD834'), '"\\udf06\\udf06\\ud834\\ud834"', 'JSON.stringify("\\uDF06\\uDF06\\uD834\\uD834")');
    assert.same(stringify('\uDF06\uDF06\uD834\uDF06'), '"\\udf06\\udf06𝌆"', 'JSON.stringify("\\uDF06\\uDF06\\uD834\\uDF06")');

    assert.same(stringify(new String('str')), '"str"', 'value-string-object-1');
    assert.same(stringify({
      key: {
        toJSON() {
          const str = new String('str');
          str.toString = () => 'toString';
          str.valueOf = () => { throw new EvalError('should not be called'); };
          return str;
        },
      },
    }), '{"key":"toString"}', 'value-string-object-2');
    assert.throws(() => stringify([true], (key, value) => {
      if (value === true) {
        const str = new String('str');
        str.toString = () => { throw new EvalError('t262'); };
        str.valueOf = () => { throw new EvalError('t262'); };
        return str;
      } return value;
    }), 'value-string-object-3');

    assert.throws(() => stringify({
      toJSON() { throw new EvalError('t262'); },
    }), EvalError, 'value-tojson-abrupt-1');

    let callCount = 0;
    let $this, $key;
    const obj6 = {
      toJSON(key) {
        callCount += 1;
        $this = this;
        $key = key;
      },
    };
    assert.same(stringify(obj6), undefined, 'value-tojson-arguments-1');
    assert.same(callCount, 1, 'value-tojson-arguments-2');
    assert.same($this, obj6, 'value-tojson-arguments-3');
    assert.same($key, '', 'value-tojson-arguments-4');
    assert.same(stringify([1, obj6, 3]), '[1,null,3]', 'value-tojson-arguments-5');
    assert.same(callCount, 2, 'value-tojson-arguments-6');
    assert.same($this, obj6, 'value-tojson-arguments-7');
    // some old implementations (like WebKit) could pass numbers as keys
    // assert.same($key, '1', 'value-tojson-arguments-8');
    assert.same(stringify({ key: obj6 }), '{}', 'value-tojson-arguments-9');
    assert.same(callCount, 3, 'value-tojson-arguments-10');
    assert.same($this, obj6, 'value-tojson-arguments-11');
    assert.same($key, 'key', 'value-tojson-arguments-12');

    const arr1 = [];
    const circular2 = [arr1];
    // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- testing
    arr1.toJSON = () => circular2;
    assert.throws(() => stringify(circular2), TypeError, 'value-tojson-array-circular');

    assert.same(stringify({ toJSON: null }), '{"toJSON":null}', 'value-tojson-not-function-1');
    assert.same(stringify({ toJSON: false }), '{"toJSON":false}', 'value-tojson-not-function-2');
    assert.same(stringify({ toJSON: [] }), '{"toJSON":[]}', 'value-tojson-not-function-3');
    assert.same(stringify({ toJSON: /re/ }), '{"toJSON":{}}', 'value-tojson-not-function-4');

    const obj7 = {};
    const circular3 = { prop: obj7 };
    obj7.toJSON = () => circular3;
    assert.throws(() => stringify(circular3), TypeError, 'value-tojson-object-circular');

    assert.same(stringify({ toJSON() { return [false]; } }), '[false]', 'value-tojson-result-1');
    const arr2 = [true];
    // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- testing
    arr2.toJSON = () => { /* empty */ };
    assert.same(stringify(arr2), undefined, 'value-tojson-result-2');
    const str3 = new String('str');
    // eslint-disable-next-line es/no-nonstandard-string-prototype-properties -- testing
    str3.toJSON = () => null;
    assert.same(stringify({ key: str3 }), '{"key":null}', 'value-tojson-result-3');
    const num3 = new Number(14);
    // eslint-disable-next-line es/no-nonstandard-number-prototype-properties -- testing
    num3.toJSON = () => ({ key: 7 });
    assert.same(stringify([num3]), '[{"key":7}]', 'value-tojson-result-4');

    // This getter will be triggered during enumeration, but the property it adds should not be enumerated.
    /* IE issue
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
    */

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

    assert.throws(() => stringify({ key: defineProperty(Array(1), '0', {
      get() { throw new EvalError('t262'); },
    }) }), EvalError, 'value-array-abrupt');

    assert.throws(() => stringify(defineProperty({}, 'key', {
      enumerable: true,
      get() { throw new EvalError('t262'); },
    })), EvalError, 'value-object-abrupt');

    assert.throws(() => stringify(defineProperty({}, 'toJSON', {
      get() { throw new EvalError('t262'); },
    })), EvalError, 'value-tojson-abrupt-2');
  });

  QUnit.test('Symbols & JSON.stringify', assert => {
    const symbol1 = Symbol('symbol & stringify test 1');
    const symbol2 = Symbol('symbol & stringify test 2');

    assert.same(stringify([
      1,
      symbol1,
      false,
      symbol2,
      {},
    ]), '[1,null,false,null,{}]', 'array value');
    assert.same(stringify({
      symbol: symbol1,
    }), '{}', 'object value');

    const object = { bar: 2 };
    object[symbol1] = 1;
    assert.same(stringify(object), '{"bar":2}', 'object key');

    assert.same(stringify(symbol1), undefined, 'symbol value');
    if (typeof symbol1 == 'symbol') {
      assert.same(stringify(Object(symbol1)), '{}', 'boxed symbol');
    }
    assert.same(stringify(undefined, () => 42), '42', 'replacer works with top-level undefined');
  });

  QUnit.test('Well‑formed JSON.stringify', assert => {
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
