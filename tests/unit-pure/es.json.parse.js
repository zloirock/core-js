// Some tests adopted from Test262 project and governed by the BSD license.
// Copyright (c) 2012 Ecma International. All rights reserved.
/* eslint-disable es/no-proxy, unicorn/escape-case -- testing */
import { FREEZING, GLOBAL, REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR } from '../helpers/constants.js';
import parse from '@core-js/pure/es/json/parse';

import defineProperty from '@core-js/pure/es/object/define-property';
import getOwnPropertyDescriptor from '@core-js/pure/es/object/get-own-property-descriptor';
import preventExtensions from '@core-js/pure/es/object/prevent-extensions';
import hasOwn from '@core-js/pure/es/object/has-own';
import keys from '@core-js/pure/es/object/keys';
import Symbol from '@core-js/pure/es/symbol';

QUnit.test('JSON.parse', assert => {
  assert.isFunction(parse);
  assert.arity(parse, 2);
  assert.name(parse, 'parse');

  for (const [reviver, note] of [[undefined, 'without reviver'], [null, 'null reviver'], [(key, value) => value, 'with reviver']]) {
    assert.throws(() => parse('12\t\r\n 34', reviver), SyntaxError, `15.12.1.1-0-1 ${ note }`); // should produce a syntax error as whitespace results in two tokens
    assert.throws(() => parse('\u000b1234', reviver), SyntaxError, `15.12.1.1-0-2 ${ note }`); // should produce a syntax error
    assert.throws(() => parse('\u000c1234', reviver), SyntaxError, `15.12.1.1-0-3 ${ note }`); // should produce a syntax error
    assert.throws(() => parse('\u00a01234', reviver), SyntaxError, `15.12.1.1-0-4 ${ note }`); // should produce a syntax error
    assert.throws(() => parse('\u200b1234', reviver), SyntaxError, `15.12.1.1-0-5 ${ note }`); // should produce a syntax error
    assert.throws(() => parse('\ufeff1234', reviver), SyntaxError, `15.12.1.1-0-6 ${ note }`); // should produce a syntax error
    assert.throws(() => parse('\u2028\u20291234', reviver), SyntaxError, `15.12.1.1-0-8 ${ note }`); // should produce a syntax error
    assert.notThrows(() => parse('\t\r \n{\t\r \n"property"\t\r \n:\t\r \n{\t\r \n}\t\r \n,\t\r \n"prop2"\t\r \n:\t\r \n' +
      '[\t\r \ntrue\t\r \n,\t\r \nnull\t\r \n,123.456\t\r \n]\t\r \n}\t\r \n', reviver), SyntaxError, `15.12.1.1-0-9 ${ note }`); // should JSON parse without error
    assert.same(parse('\t1234', reviver), 1234, `15.12.1.1-g1-1-1 ${ note }`); // '<TAB> should be ignored'
    assert.throws(() => parse('12\t34', reviver), SyntaxError, `15.12.1.1-g1-1-2 ${ note }`); // <TAB> should produce a syntax error as whitespace results in two tokens
    assert.same(parse('\r1234', reviver), 1234, `15.12.1.1-g1-2-1 ${ note }`); // '<CR> should be ignored'
    assert.throws(() => parse('12\r34', reviver), SyntaxError, `15.12.1.1-g1-2-2 ${ note }`); // <CR> should produce a syntax error as whitespace results in two tokens
    assert.same(parse('\n1234', reviver), 1234, `15.12.1.1-g1-3-1 ${ note }`); // '<LF> should be ignored'
    assert.throws(() => parse('12\n34', reviver), SyntaxError, `15.12.1.1-g1-3-2 ${ note }`); // <LF> should produce a syntax error as whitespace results in two tokens
    assert.same(parse(' 1234', reviver), 1234, `15.12.1.1-g1-4-1 ${ note }`); // '<SP> should be ignored'
    assert.throws(() => parse('12 34', reviver), SyntaxError, `15.12.1.1-g1-4-2 ${ note }`); // <SP> should produce a syntax error as whitespace results in two tokens
    assert.same(parse('"abc"', reviver), 'abc', `15.12.1.1-g2-1 ${ note }`);
    assert.throws(() => parse("'abc'", reviver), SyntaxError, `15.12.1.1-g2-2 ${ note }`);
    assert.throws(() => parse('\\u0022abc\\u0022', reviver), SyntaxError, `15.12.1.1-g2-3 ${ note }`);
    assert.throws(() => parse('"abc\'', reviver), SyntaxError, `15.12.1.1-g2-4 ${ note }`);
    assert.same(parse('""', reviver), '', `15.12.1.1-g2-5 ${ note }`);
    // invalid string characters should produce a syntax error
    assert.throws(() => parse('"\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007"', reviver), SyntaxError, `15.12.1.1-g4-1 ${ note }`);
    assert.throws(() => parse('"\u0008\u0009\u000a\u000b\u000c\u000d\u000e\u000f"', reviver), SyntaxError, `15.12.1.1-g4-2 ${ note }`);
    assert.throws(() => parse('"\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017"', reviver), SyntaxError, `15.12.1.1-g4-3 ${ note }`);
    assert.throws(() => parse('"\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f"', reviver), SyntaxError, `15.12.1.1-g4-4 ${ note }`);
    assert.same(parse('"\\u0058"', reviver), 'X', `15.12.1.1-g5-1 ${ note }`);
    assert.throws(() => parse('"\\u005"', reviver), SyntaxError, `15.12.1.1-g5-2 ${ note }`);
    assert.throws(() => parse('"\\u0X50"', reviver), SyntaxError, `15.12.1.1-g5-3 ${ note }`);
    assert.same(parse('"\\/"', reviver), '/', `15.12.1.1-g6-1 ${ note }`);
    assert.same(parse('"\\\\"', reviver), '\\', `15.12.1.1-g6-2 ${ note }`);
    assert.same(parse('"\\b"', reviver), '\b', `15.12.1.1-g6-3 ${ note }`);
    assert.same(parse('"\\f"', reviver), '\f', `15.12.1.1-g6-4 ${ note }`);
    assert.same(parse('"\\n"', reviver), '\n', `15.12.1.1-g6-5 ${ note }`);
    assert.same(parse('"\\r"', reviver), '\r', `15.12.1.1-g6-6 ${ note }`);
    assert.same(parse('"\\t"', reviver), '\t', `15.12.1.1-g6-7 ${ note }`);

    const nullChars = [
      '"\u0000"',
      '"\u0001"',
      '"\u0002"',
      '"\u0003"',
      '"\u0004"',
      '"\u0005"',
      '"\u0006"',
      '"\u0007"',
      '"\u0008"',
      '"\u0009"',
      '"\u000A"',
      '"\u000B"',
      '"\u000C"',
      '"\u000D"',
      '"\u000E"',
      '"\u000F"',
      '"\u0010"',
      '"\u0011"',
      '"\u0012"',
      '"\u0013"',
      '"\u0014"',
      '"\u0015"',
      '"\u0016"',
      '"\u0017"',
      '"\u0018"',
      '"\u0019"',
      '"\u001A"',
      '"\u001B"',
      '"\u001C"',
      '"\u001D"',
      '"\u001E"',
      '"\u001F"',
    ];

    for (let i = 0; i < nullChars.length; i++) {
      assert.throws(() => parse(`{${ nullChars[i] } : "John" }`, reviver), SyntaxError, `15.12.2-2-1-${ i } ${ note }`);
      assert.throws(() => parse(`{${ nullChars[i] }name : "John" }`, reviver), SyntaxError, `15.12.2-2-2-${ i } ${ note }`);
      assert.throws(() => parse(`{name${ nullChars[i] } : "John" }`, reviver), SyntaxError, `15.12.2-2-3-${ i } ${ note }`);
      assert.throws(() => parse(`{${ nullChars[i] }name${ nullChars[i] } : "John" }`, reviver), SyntaxError, `15.12.2-2-4-${ i } ${ note }`);
      assert.throws(() => parse(`{na${ nullChars[i] }me : "John" }`, reviver), SyntaxError, `15.12.2-2-5-${ i } ${ note }`);
      assert.throws(() => parse(`{ "name" : ${ nullChars[i] } }`, reviver), SyntaxError, `15.12.2-2-6-${ i } ${ note }`);
      assert.throws(() => parse(`{ "name" : ${ nullChars[i] }John }`, reviver), SyntaxError, `15.12.2-2-7-${ i } ${ note }`);
      assert.throws(() => parse(`{ "name" : John${ nullChars[i] } }`, reviver), SyntaxError, `15.12.2-2-8-${ i } ${ note }`);
      assert.throws(() => parse(`{ "name" : ${ nullChars[i] }John${ nullChars[i] } }`, reviver), SyntaxError, `15.12.2-2-9-${ i } ${ note }`);
      assert.throws(() => parse(`{ "name" : Jo${ nullChars[i] }hn }`, reviver), SyntaxError, `15.12.2-2-10-${ i } ${ note }`);
    }

    // eslint-disable-next-line no-proto -- testing
    assert.same(parse('{ "__proto__": 1, "__proto__": 2 }', reviver).__proto__, 2, `duplicate proto ${ note }`);

    assert.throws(() => parse('\u16801', reviver), SyntaxError, `15.12.1.1-0-7-1 ${ note }`); // invalid whitespace
    assert.throws(() => parse('\u180e1', reviver), SyntaxError, `15.12.1.1-0-7-2 ${ note }`); // invalid whitespace
    assert.throws(() => parse('\u20001', reviver), SyntaxError, `15.12.1.1-0-7-3 ${ note }`); // invalid whitespace
    assert.throws(() => parse('\u20011', reviver), SyntaxError, `15.12.1.1-0-7-4 ${ note }`); // invalid whitespace
    assert.throws(() => parse('\u20021', reviver), SyntaxError, `15.12.1.1-0-7-5 ${ note }`); // invalid whitespace
    assert.throws(() => parse('\u20031', reviver), SyntaxError, `15.12.1.1-0-7-6 ${ note }`); // invalid whitespace
    assert.throws(() => parse('\u20041', reviver), SyntaxError, `15.12.1.1-0-7-7 ${ note }`); // invalid whitespace
    assert.throws(() => parse('\u20051', reviver), SyntaxError, `15.12.1.1-0-7-8 ${ note }`); // invalid whitespace
    assert.throws(() => parse('\u20061', reviver), SyntaxError, `15.12.1.1-0-7-9 ${ note }`); // invalid whitespace
    assert.throws(() => parse('\u20071', reviver), SyntaxError, `15.12.1.1-0-7-10 ${ note }`); // invalid whitespace
    assert.throws(() => parse('\u20081', reviver), SyntaxError, `15.12.1.1-0-7-11 ${ note }`); // invalid whitespace
    assert.throws(() => parse('\u20091', reviver), SyntaxError, `15.12.1.1-0-7-12 ${ note }`); // invalid whitespace
    assert.throws(() => parse('\u200a1', reviver), SyntaxError, `15.12.1.1-0-7-13 ${ note }`); // invalid whitespace
    assert.throws(() => parse('\u202f1', reviver), SyntaxError, `15.12.1.1-0-7-14 ${ note }`); // invalid whitespace
    assert.throws(() => parse('\u205f1', reviver), SyntaxError, `15.12.1.1-0-7-15 ${ note }`); // invalid whitespace
    assert.throws(() => parse('\u30001', reviver), SyntaxError, `15.12.1.1-0-7-16 ${ note }`); // invalid whitespace

    assert.same(parse('-0', reviver), -0, `negative-zero-1 ${ note }`);
    assert.same(parse(' \n-0', reviver), -0, `negative-zero-2 ${ note }`);
    assert.same(parse('-0  \t', reviver), -0, `negative-zero-3 ${ note }`);
    assert.same(parse('\n\t -0\n   ', reviver), -0, `negative-zero-4 ${ note }`);
    assert.same(parse(-0, reviver), 0, `negative-zero-5 ${ note }`);

    assert.throws(() => parse('01', reviver), SyntaxError, `leading-zero-1 ${ note }`);
    assert.throws(() => parse('-01', reviver), SyntaxError, `leading-zero-2 ${ note }`);
    assert.throws(() => parse('00', reviver), SyntaxError, `leading-zero-3 ${ note }`);
    assert.throws(() => parse('[01]', reviver), SyntaxError, `leading-zero-array ${ note }`);
    assert.throws(() => parse('{"a":01}', reviver), SyntaxError, `leading-zero-object ${ note }`);
    assert.same(parse('0.1', reviver), 0.1, `leading-zero-fraction ${ note }`);

    assert.throws(() => parse('1.', reviver), SyntaxError, `number-fraction-no-digits-1 ${ note }`);
    assert.throws(() => parse('-0.', reviver), SyntaxError, `number-fraction-no-digits-2 ${ note }`);
    assert.throws(() => parse('1.e5', reviver), SyntaxError, `number-fraction-no-digits-3 ${ note }`);
    assert.throws(() => parse('[1.,2]', reviver), SyntaxError, `number-fraction-no-digits-4 ${ note }`);

    assert.throws(() => parse('{"a":1,}', reviver), SyntaxError, `trailing-object-comma ${ note }`);
    assert.throws(() => parse('{"a":1,}x":2}', reviver), SyntaxError, `brace-instead-of-key-quote ${ note }`);
    assert.throws(() => parse('{"a":1,}":2}', reviver), SyntaxError, `brace-instead-of-empty-key-quote ${ note }`);
    assert.throws(() => parse('{"a":1, }}":2}', reviver), SyntaxError, `brace-key-after-whitespace ${ note }`);
    assert.throws(() => parse('[{"a":1,}":2},3]', reviver), SyntaxError, `nested-brace-key ${ note }`);
    assert.throws(() => parse('[1,]', reviver), SyntaxError, `trailing-array-comma ${ note }`);
    assert.deepEqual(parse('{"a":1,"}":2}', reviver), { a: 1, '}': 2 }, `quoted-brace-key ${ note }`);
    assert.deepEqual(parse('{"a":1,"":2}', reviver), { a: 1, '': 2 }, `empty-key-after-comma ${ note }`);

    assert.throws(() => parse('{', reviver), SyntaxError, `unterminated-object-1 ${ note }`);
    assert.throws(() => parse('{"a":1,', reviver), SyntaxError, `unterminated-object-2 ${ note }`);
    assert.throws(() => parse('[', reviver), SyntaxError, `unterminated-array-1 ${ note }`);
    assert.throws(() => parse('[1,', reviver), SyntaxError, `unterminated-array-2 ${ note }`);

    assert.throws(() => parse(undefined, reviver), SyntaxError, `undefined ${ note }`);
    assert.throws(() => parse(Symbol('JSON.parse test'), reviver), TypeError, `symbol ${ note }`);
    assert.throws(() => parse(Object(Symbol('JSON.parse test')), reviver), TypeError, `boxed symbol ${ note }`);
    assert.same(parse(null, reviver), null, `null ${ note }`);
    assert.same(parse(false, reviver), false, `false ${ note }`);
    assert.same(parse(true, reviver), true, `true ${ note }`);
    assert.same(parse(0, reviver), 0, `0 ${ note }`);
    assert.same(parse(3.14, reviver), 3.14, `3.14 ${ note }`);

    let stringCalls = 0;
    assert.same(parse({
      toString() {
        stringCalls++;
        return '"string"';
      },
      valueOf() {
        return '"default_or_number"';
      },
    }, reviver), 'string', `text-object ${ note }`);
    assert.same(stringCalls, 1, `text-object converted once ${ note }`);

    assert.throws(() => parse({
      toString: null,
      valueOf() {
        throw new EvalError('t262');
      },
    }, reviver), EvalError, `text-object-abrupt-1 ${ note }`);

    assert.throws(() => parse({
      toString() {
        throw new EvalError('t262');
      },
    }, reviver), EvalError, `text-object-abrupt-2 ${ note }`);
  }

  // eslint-disable-next-line no-extend-native -- testing
  Array.prototype[1] = 3;
  const arr1 = parse('[1, 2]', function (key, value) {
    if (key === '0') delete this[1];
    return value;
  });
  delete Array.prototype[1];
  assert.same(arr1[0], 1, 'reviver-array-get-prop-from-prototype-1');
  assert.true(hasOwn(arr1, '1'), 'reviver-array-get-prop-from-prototype-2');
  assert.same(arr1[1], 3, 'reviver-array-get-prop-from-prototype-3');

  // eslint-disable-next-line no-extend-native -- testing
  Object.prototype.b = 3;
  const obj1 = parse('{"a": 1, "b": 2}', function (key, value) {
    if (key === 'a') delete this.b;
    return value;
  });
  delete Object.prototype.b;
  assert.same(obj1.a, 1, 'reviver-object-get-prop-from-prototype-1');
  assert.true(hasOwn(obj1, 'b'), 'reviver-object-get-prop-from-prototype-2');
  assert.same(obj1.b, 3, 'reviver-object-get-prop-from-prototype-3');

  const arr2 = parse('[1, 2]', function (key, value) {
    if (key === '0') defineProperty(this, '1', { configurable: false });
    else if (key === '1') return 22;
    return value;
  });
  assert.same(arr2[0], 1, 'reviver-array-non-configurable-prop-create-1');
  assert.same(arr2[1], 2, 'reviver-array-non-configurable-prop-create-2');

  const arr3 = parse('[1, 2]', function (key, value) {
    if (key === '0') defineProperty(this, '1', { configurable: false });
    else if (key === '1') return;
    return value;
  });
  assert.same(arr3[0], 1, 'reviver-array-non-configurable-prop-delete-1');
  assert.true(hasOwn(arr3, '1'), 'reviver-array-non-configurable-prop-delete-2');
  assert.same(arr3[1], 2, 'reviver-array-non-configurable-prop-delete-3');

  const obj2 = parse('{"a": 1, "b": 2}', function (key, value) {
    if (key === 'a') defineProperty(this, 'b', { configurable: false });
    else if (key === 'b') return 22;
    return value;
  });
  assert.same(obj2.a, 1, 'reviver-object-non-configurable-prop-create-1');
  assert.same(obj2.b, 2, 'reviver-object-non-configurable-prop-create-2');

  const obj3 = parse('{"a": 1, "b": 2}', function (key, value) {
    if (key === 'a') defineProperty(this, 'b', { configurable: false });
    else if (key === 'b') return;
    return value;
  });
  assert.same(obj3.a, 1, 'reviver-object-non-configurable-prop-delete-1');
  assert.true(hasOwn(obj3, 'b'), 'reviver-object-non-configurable-prop-delete-2');
  assert.same(obj3.b, 2, 'reviver-object-non-configurable-prop-delete-3');

  assert.throws(() => parse('[0,0]', function () {
    defineProperty(this, '1', { get: () => { throw new EvalError('t262'); } });
  }), EvalError, 'reviver-get-name-err');

  if (FREEZING) {
    for (const array of [false, true]) {
      for (const change of ['keep', 'delete', 'shorten']) {
        if (!array && change === 'shorten') continue;
        const first = array ? '0' : 'a';
        const second = array ? '1' : 'b';
        const calls = [];
        const result = parse(array ? '[1,2]' : '{"a":1,"b":2}', function (key, value) {
          calls.push(key);
          if (key === first) {
            if (change === 'delete') delete this[second];
            if (change === 'shorten') this.length = 1;
            preventExtensions(this);
          }
          return key === second ? 22 : value;
        });
        assert.same(result[first], 1, `non-extensible first property ${ array } ${ change }`);
        assert.same(hasOwn(result, second), change === 'keep', `non-extensible second property ${ array } ${ change }`);
        if (change === 'keep') assert.same(result[second], 22, `non-extensible existing property ${ array }`);
        if (array) assert.same(result.length, change === 'shorten' ? 1 : 2, `non-extensible array length ${ change }`);
        assert.arrayEqual(calls, [first, second, ''], `non-extensible reviver order ${ array } ${ change }`);
      }
    }
  }

  if (REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR) {
    for (const length of [0, 1]) {
      const calls = [];
      const result = parse('[1,2]', function (key, value) {
        calls.push(key);
        if (key === '0') defineProperty(this, 'length', { value: length, writable: false });
        return key === '0' ? 11 : key === '1' ? 22 : value;
      });
      assert.arrayEqual(result, length ? [11] : [], `non-writable array length ${ length }`);
      assert.same(getOwnPropertyDescriptor(result, 'length').writable, false, `array length stays non-writable ${ length }`);
      assert.arrayEqual(calls, ['0', '1', ''], `non-writable length reviver order ${ length }`);
    }
  }

  if (typeof Proxy == 'function') {
    for (const operation of ['defineProperty', 'deleteProperty']) {
      const error = new TypeError('reviver proxy trap');
      let properReflect = false;
      // Proxy failure semantics require correct Reflect operations.
      // Their absence is an accepted limitation, including Firefox 18-41.
      try {
        const method = GLOBAL.Reflect[operation];
        const rejecting = new Proxy({}, { [operation]() { return false; } });
        if (method(rejecting, 'x', { value: 1 }) === false) {
          method(new Proxy({}, { [operation]() { throw error; } }), 'x', { value: 1 });
        }
      } catch (error_) {
        properReflect = error_ === error;
      }
      if (!properReflect) continue;

      const reflectMethod = GLOBAL.Reflect[operation];
      try {
        GLOBAL.Reflect[operation] = () => { throw error; };
        const proxy = new Proxy({ x: 1 }, { [operation]() { return false; } });
        assert.notThrows(() => parse('{"before":0,"target":0}', function (key, value) {
          if (key === 'before') this.target = proxy;
          return key === 'x' && operation === 'deleteProperty' ? undefined : value;
        }), `captured Reflect ${ operation }`);
      } finally {
        GLOBAL.Reflect[operation] = reflectMethod;
      }

      for (const array of [false, true]) {
        for (const abrupt of [false, true]) {
          const target = array ? [1] : { x: 1 };
          const name = array ? '0' : 'x';
          const calls = [];
          const proxy = new Proxy(target, {
            ownKeys() {
              calls.push('keys');
              return array ? ['0', 'length'] : ['x'];
            },
            getOwnPropertyDescriptor(object, key) {
              calls.push(`descriptor:${ key }`);
              return getOwnPropertyDescriptor(object, key);
            },
            get(object, key) {
              calls.push(`get:${ String(key) }`);
              return object[key];
            },
            [operation](object, key) {
              calls.push(`${ operation }:${ key }`);
              if (abrupt) throw error;
              return false;
            },
          });
          const revive = function (key, value) {
            if (key === 'before') this.target = proxy;
            return key === name ? operation === 'deleteProperty' ? undefined : 2 : value;
          };
          if (abrupt) {
            assert.throws(() => parse('{"before":0,"target":0}', revive), caught => caught === error, `proxy abrupt ${ operation } ${ array }`);
          } else {
            const result = parse('{"before":0,"target":0}', revive);
            assert.same(result.target, proxy, `proxy preserved ${ operation } ${ array }`);
            assert.same(target[name], 1, `proxy rejection ignored ${ operation } ${ array }`);
          }
          assert.arrayEqual(calls, array
            ? ['get:length', 'get:0', `${ operation }:0`]
            : ['keys', 'descriptor:x', 'get:x', `${ operation }:x`], `proxy trap order ${ operation } ${ array } ${ abrupt }`);
        }
      }
    }
  }

  assert.throws(() => parse('0', () => { throw new EvalError('t262'); }), EvalError, 'reviver-call-err');

  // FF20- enumeration order issue
  if (keys({ k: 1, 2: 3 })[0] === '2') {
    const calls = [];
    parse('{"p1":0,"p2":0,"p1":0,"2":0,"1":0}', (name, val) => {
      calls.push(name);
      return val;
    });
    // The empty string is the _rootName_ in JSON.parse
    assert.arrayEqual(calls, ['1', '2', 'p1', 'p2', ''], 'reviver-call-order');
  }

  assert.throws(() => parse(), SyntaxError, 'no args');
});

QUnit.test('JSON.parse source access', assert => {
  function spy(k, v, { source: $source }) {
    return source = $source;
  }
  let source;
  parse('1234', spy);
  assert.same(source, '1234', '1234');
  parse('"1234"', spy);
  assert.same(source, '"1234"', '"1234"');
  parse('null', spy);
  assert.same(source, 'null', 'null');
  parse('true', spy);
  assert.same(source, 'true', 'true');
  parse('false', spy);
  assert.same(source, 'false', 'false');
  parse('{}', spy);
  assert.same(source, undefined, '{}');
  parse('[]', spy);
  assert.same(source, undefined, '[]');
  parse('9007199254740993', spy);
  assert.same(source, '9007199254740993', '9007199254740993');

  for (const [text, zero] of [['0', 0], ['-0', -0]]) {
    for (const array of [false, true]) {
      for (const changed of [false, true]) {
        const first = array ? '0' : 'a';
        const second = array ? '1' : 'b';
        let context;
        const result = parse(array ? `[1,${ text }]` : `{"a":1,"b":${ text }}`, function (key, value, currentContext) {
          if (key === first) this[second] = changed ? -zero : zero;
          if (key === second) context = currentContext;
          return value;
        });
        assert.same(result[second], changed ? -zero : zero, `reviver zero value ${ text } ${ array } ${ changed }`);
        assert.same(hasOwn(context, 'source'), !changed, `reviver zero source presence ${ text } ${ array } ${ changed }`);
        if (!changed) assert.same(context.source, text, `reviver unchanged zero source ${ text } ${ array }`);
      }
    }
  }
});
