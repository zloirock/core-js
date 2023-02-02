import { DESCRIPTORS, PROTO } from '../helpers/constants';
// Some tests from Test262 project and governed by the BSD license.
// Copyright (c) 2012 Ecma International.  All rights reserved.
/* eslint-disable unicorn/escape-case -- testing */
QUnit.test('JSON.parse', assert => {
  const { parse } = JSON;
  const { defineProperty, hasOwn } = Object;
  assert.isFunction(parse);
  assert.arity(parse, 2);
  assert.name(parse, 'parse');
  assert.looksNative(parse);

  assert.throws(() => parse('12\t\r\n 34'), SyntaxError, '15.12.1.1-0-1'); // should produce a syntax error as whitespace results in two tokens
  assert.throws(() => parse('\u000b1234'), SyntaxError, '15.12.1.1-0-2'); // should produce a syntax error
  assert.throws(() => parse('\u000c1234'), SyntaxError, '15.12.1.1-0-3'); // should produce a syntax error
  assert.throws(() => parse('\u00a01234'), SyntaxError, '15.12.1.1-0-4'); // should produce a syntax error
  assert.throws(() => parse('\u200b1234'), SyntaxError, '15.12.1.1-0-5'); // should produce a syntax error
  assert.throws(() => parse('\ufeff1234'), SyntaxError, '15.12.1.1-0-6'); // should produce a syntax error
  assert.throws(() => parse('\u2028\u20291234'), SyntaxError, '15.12.1.1-0-8'); // should produce a syntax error
  assert.notThrows(() => parse('\t\r \n{\t\r \n"property"\t\r \n:\t\r \n{\t\r \n}\t\r \n,\t\r \n"prop2"\t\r \n:\t\r \n' +
    '[\t\r \ntrue\t\r \n,\t\r \nnull\t\r \n,123.456\t\r \n]\t\r \n}\t\r \n'), SyntaxError, '15.12.1.1-0-9'); // should JSON parse without error
  assert.same(parse('\t1234'), 1234, '15.12.1.1-g1-1-1'); // '<TAB> should be ignored'
  assert.throws(() => parse('12\t34'), SyntaxError, '15.12.1.1-g1-1-2'); // <TAB> should produce a syntax error as whitespace results in two tokens
  assert.same(parse('\r1234'), 1234, '15.12.1.1-g1-2-1'); // '<CR> should be ignored'
  assert.throws(() => parse('12\r34'), SyntaxError, '15.12.1.1-g1-2-2'); // <CR> should produce a syntax error as whitespace results in two tokens
  assert.same(parse('\n1234'), 1234, '15.12.1.1-g1-3-1'); // '<LF> should be ignored'
  assert.throws(() => parse('12\n34'), SyntaxError, '15.12.1.1-g1-3-2'); // <LF> should produce a syntax error as whitespace results in two tokens
  assert.same(parse(' 1234'), 1234, '15.12.1.1-g1-4-1'); // '<SP> should be ignored'
  assert.throws(() => parse('12 34'), SyntaxError, '15.12.1.1-g1-4-2'); // <SP> should produce a syntax error as whitespace results in two tokens
  assert.same(parse('"abc"'), 'abc', '15.12.1.1-g2-1');
  assert.throws(() => parse("'abc'"), SyntaxError, '15.12.1.1-g2-2');
  assert.throws(() => parse('\\u0022abc\\u0022'), SyntaxError, '15.12.1.1-g2-3');
  assert.throws(() => parse('"abc\''), SyntaxError, '15.12.1.1-g2-4');
  assert.same(parse('""'), '', '15.12.1.1-g2-5');
  assert.throws(() => parse('"\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007"'), SyntaxError, '15.12.1.1-g4-1'); // invalid string characters should produce a syntax error
  assert.throws(() => parse('"\u0008\u0009\u000a\u000b\u000c\u000d\u000e\u000f"'), SyntaxError, '15.12.1.1-g4-2'); // invalid string characters should produce a syntax error
  assert.throws(() => parse('"\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017"'), SyntaxError, '15.12.1.1-g4-3'); // invalid string characters should produce a syntax error
  assert.throws(() => parse('"\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f"'), SyntaxError, '15.12.1.1-g4-4'); // invalid string characters should produce a syntax error
  assert.same(parse('"\\u0058"'), 'X', '15.12.1.1-g5-1');
  assert.throws(() => parse('"\\u005"'), SyntaxError, '15.12.1.1-g5-2');
  assert.throws(() => parse('"\\u0X50"'), SyntaxError, '15.12.1.1-g5-3');
  assert.same(parse('"\\/"'), '/', '15.12.1.1-g6-1');
  assert.same(parse('"\\\\"'), '\\', '15.12.1.1-g6-2');
  assert.same(parse('"\\b"'), '\b', '15.12.1.1-g6-3');
  assert.same(parse('"\\f"'), '\f', '15.12.1.1-g6-4');
  assert.same(parse('"\\n"'), '\n', '15.12.1.1-g6-5');
  assert.same(parse('"\\r"'), '\r', '15.12.1.1-g6-6');
  assert.same(parse('"\\t"'), '\t', '15.12.1.1-g6-7');

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
    assert.throws(() => parse(`{${ nullChars[i] } : "John" }`), SyntaxError, `15.12.2-2-1-${ i }`);
    assert.throws(() => parse(`{${ nullChars[i] }name : "John" }`), SyntaxError, `15.12.2-2-2-${ i }`);
    assert.throws(() => parse(`{name${ nullChars[i] } : "John" }`), SyntaxError, `15.12.2-2-3-${ i }`);
    assert.throws(() => parse(`{${ nullChars[i] }name${ nullChars[i] } : "John" }`), SyntaxError, `15.12.2-2-4-${ i }`);
    assert.throws(() => parse(`{na${ nullChars[i] }me : "John" }`), SyntaxError, `15.12.2-2-5-${ i }`);
    assert.throws(() => parse(`{ "name" : ${ nullChars[i] } }`), SyntaxError, `15.12.2-2-6-${ i }`);
    assert.throws(() => parse(`{ "name" : ${ nullChars[i] }John }`), SyntaxError, `15.12.2-2-7-${ i }`);
    assert.throws(() => parse(`{ "name" : John${ nullChars[i] } }`), SyntaxError, `15.12.2-2-8-${ i }`);
    assert.throws(() => parse(`{ "name" : ${ nullChars[i] }John${ nullChars[i] } }`), SyntaxError, `15.12.2-2-9-${ i }`);
    assert.throws(() => parse(`{ "name" : Jo${ nullChars[i] }hn }`), SyntaxError, `15.12.2-2-10-${ i }`);
  }

  if (PROTO) {
    // eslint-disable-next-line no-proto -- testing
    assert.same(parse('{ "__proto__": 1, "__proto__": 2 }').__proto__, 2, 'duplicate proto');
  }

  assert.throws(() => parse('\u16801'), SyntaxError, '15.12.1.1-0-7-1'); // invalid whitespace
  assert.throws(() => parse('\u180e1'), SyntaxError, '15.12.1.1-0-7-2'); // invalid whitespace
  assert.throws(() => parse('\u20001'), SyntaxError, '15.12.1.1-0-7-3'); // invalid whitespace
  assert.throws(() => parse('\u20011'), SyntaxError, '15.12.1.1-0-7-4'); // invalid whitespace
  assert.throws(() => parse('\u20021'), SyntaxError, '15.12.1.1-0-7-5'); // invalid whitespace
  assert.throws(() => parse('\u20031'), SyntaxError, '15.12.1.1-0-7-6'); // invalid whitespace
  assert.throws(() => parse('\u20041'), SyntaxError, '15.12.1.1-0-7-7'); // invalid whitespace
  assert.throws(() => parse('\u20051'), SyntaxError, '15.12.1.1-0-7-8'); // invalid whitespace
  assert.throws(() => parse('\u20061'), SyntaxError, '15.12.1.1-0-7-9'); // invalid whitespace
  assert.throws(() => parse('\u20071'), SyntaxError, '15.12.1.1-0-7-10'); // invalid whitespace
  assert.throws(() => parse('\u20081'), SyntaxError, '15.12.1.1-0-7-11'); // invalid whitespace
  assert.throws(() => parse('\u20091'), SyntaxError, '15.12.1.1-0-7-12'); // invalid whitespace
  assert.throws(() => parse('\u200a1'), SyntaxError, '15.12.1.1-0-7-13'); // invalid whitespace
  assert.throws(() => parse('\u202f1'), SyntaxError, '15.12.1.1-0-7-14'); // invalid whitespace
  assert.throws(() => parse('\u205f1'), SyntaxError, '15.12.1.1-0-7-15'); // invalid whitespace
  assert.throws(() => parse('\u30001'), SyntaxError, '15.12.1.1-0-7-16'); // invalid whitespace

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
  const obj1 = JSON.parse('{"a": 1, "b": 2}', function (key, value) {
    if (key === 'a') delete this.b;
    return value;
  });
  delete Object.prototype.b;
  assert.same(obj1.a, 1, 'reviver-object-get-prop-from-prototype-1');
  assert.true(hasOwn(obj1, 'b'), 'reviver-object-get-prop-from-prototype-2');
  assert.same(obj1.b, 3, 'reviver-object-get-prop-from-prototype-3');

  if (DESCRIPTORS) {
    const arr2 = parse('[1, 2]', function (key, value) {
      if (key === '0') defineProperty(this, '1', { configurable: false });
      if (key === '1') return 22;
      return value;
    });
    assert.same(arr2[0], 1, 'reviver-array-non-configurable-prop-create-1');
    assert.same(arr2[1], 2, 'reviver-array-non-configurable-prop-create-2');

    const arr3 = parse('[1, 2]', function (key, value) {
      if (key === '0') defineProperty(this, '1', { configurable: false });
      if (key === '1') return;
      return value;
    });
    assert.same(arr3[0], 1, 'reviver-array-non-configurable-prop-delete-1');
    assert.true(hasOwn(arr3, '1'), 'reviver-array-non-configurable-prop-delete-2');
    assert.same(arr3[1], 2, 'reviver-array-non-configurable-prop-delete-3');

    const obj2 = parse('{"a": 1, "b": 2}', function (key, value) {
      if (key === 'a') defineProperty(this, 'b', { configurable: false });
      if (key === 'b') return 22;
      return value;
    });
    assert.same(obj2.a, 1, 'reviver-object-non-configurable-prop-create-1');
    assert.same(obj2.b, 2, 'reviver-object-non-configurable-prop-create-2');

    const obj3 = parse('{"a": 1, "b": 2}', function (key, value) {
      if (key === 'a') defineProperty(this, 'b', { configurable: false });
      if (key === 'b') return;
      return value;
    });
    assert.same(obj3.a, 1, 'reviver-object-non-configurable-prop-delete-1');
    assert.true(hasOwn(obj3, 'b'), 'reviver-object-non-configurable-prop-delete-2');
    assert.same(obj3.b, 2, 'reviver-object-non-configurable-prop-delete-3');

    assert.throws(() => parse('[0,0]', function () {
      defineProperty(this, '1', { get: () => { throw EvalError('t262'); } });
    }), EvalError, 'reviver-get-name-err');
  }

  assert.throws(() => parse('0', () => { throw EvalError('t262'); }), EvalError, 'reviver-call-err');

  const calls = [];
  parse('{"p1":0,"p2":0,"p1":0,"2":0,"1":0}', (name, val) => {
    calls.push(name);
    return val;
  });
  // The empty string is the _rootName_ in JSON.parse
  assert.arrayEqual(calls, ['1', '2', 'p1', 'p2', ''], 'reviver-call-order');

  assert.same(parse('-0'), -0, 'negative-zero-1');
  assert.same(parse(' \n-0'), -0, 'negative-zero-2');
  assert.same(parse('-0  \t'), -0, 'negative-zero-3');
  assert.same(parse('\n\t -0\n   '), -0, 'negative-zero-4');
  assert.same(parse(-0), 0, 'negative-zero-5');

  assert.throws(() => parse(), SyntaxError, 'no args');
  assert.throws(() => parse(undefined), SyntaxError, 'undefined');
  assert.throws(() => parse(Symbol()), TypeError, 'symbol');
  assert.same(parse(null), null, 'null');
  assert.same(parse(false), false, 'false');
  assert.same(parse(true), true, 'true');
  assert.same(parse(0), 0, '0');
  assert.same(parse(3.14), 3.14, '3.14');

  assert.same(parse({
    toString() {
      return '"string"';
    },
    valueOf() {
      return '"default_or_number"';
    },
  }), 'string', 'text-object');

  assert.throws(() => parse({
    toString: null,
    valueOf() {
      throw EvalError('t262');
    },
  }), EvalError, 'text-object-abrupt-1');

  assert.throws(() => parse({
    toString() {
      throw EvalError('t262');
    },
  }), EvalError, 'text-object-abrupt-2');
});

QUnit.test('JSON.parse source access', assert => {
  const { parse } = JSON;
  let spy;
  parse('1234', (k, v, { source }) => spy = source);
  assert.same(spy, '1234', '1234');
  parse('"1234"', (k, v, { source }) => spy = source);
  assert.same(spy, '"1234"', '"1234"');
  parse('null', (k, v, { source }) => spy = source);
  assert.same(spy, 'null', 'null');
  parse('true', (k, v, { source }) => spy = source);
  assert.same(spy, 'true', 'true');
  parse('false', (k, v, { source }) => spy = source);
  assert.same(spy, 'false', 'false');
  parse('{}', (k, v, { source }) => spy = source);
  assert.same(spy, undefined, '{}');
  parse('[]', (k, v, { source }) => spy = source);
  assert.same(spy, undefined, '[]');
  parse('9007199254740993', (k, v, { source }) => spy = source);
  assert.same(spy, '9007199254740993', '9007199254740993');
});
