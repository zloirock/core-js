/* eslint-disable sonarjs/inconsistent-function-call -- required for testing */
import globalThis from '@core-js/pure/es/global-this';
import create from '@core-js/pure/es/object/create';
import Number from '@core-js/pure/es/number';
import Symbol from '@core-js/pure/es/symbol';

const NativeNumber = globalThis.Number;
const whitespaces = ' \t\u000B\f\u00A0\uFEFF\n\r\u2028\u2029\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000';

function getCheck(assert) {
  return function (a, b) {
    assert.same(Number(a), b, `Number ${ typeof a } ${ a } -> ${ b }`);
    const x = new Number(a);
    assert.same(x, Object(x), `new Number ${ typeof a } ${ a } is object`);
    assert.same({}.toString.call(x).slice(8, -1), 'Number', `classof new Number ${ typeof a } ${ a } is Number`);
    assert.same(x.valueOf(), b, `new Number(${ typeof a } ${ a }).valueOf() -> ${ b }`);
  };
}

QUnit.test('Number constructor: regression', assert => {
  const check = getCheck(assert);
  assert.isFunction(Number);
  assert.same(Number.prototype.constructor, NativeNumber);
  assert.same(1.0.constructor, NativeNumber);
  const constants = ['MAX_VALUE', 'MIN_VALUE', 'NaN', 'NEGATIVE_INFINITY', 'POSITIVE_INFINITY'];
  for (const constant of constants) {
    assert.true(constant in Number, `Number.${ constant }`);
    assert.nonEnumerable(Number, constant);
  }
  assert.same(Number(), 0);
  assert.same(new Number().valueOf(), 0);
  check(42, 42);
  check(42.42, 42.42);
  check(new Number(42), 42);
  check(new Number(42.42), 42.42);
  check('42', 42);
  check('42.42', 42.42);
  check('0x42', 66);
  check('0X42', 66);
  check('0xzzz', NaN);
  check('0x1g', NaN);
  check('+0x1', NaN);
  check('-0x1', NaN);
  check('+0X1', NaN);
  check('-0X1', NaN);
  check(new String('42'), 42);
  check(new String('42.42'), 42.42);
  check(new String('0x42'), 66);
  check(null, 0);
  check(undefined, NaN);
  check(false, 0);
  check(true, 1);
  check(new Boolean(false), 0);
  check(new Boolean(true), 1);
  check({}, NaN);
  check({
    valueOf: '1.1',
  }, NaN);
  check({
    valueOf: '1.1',
    toString() {
      return '2.2';
    },
  }, 2.2);
  check({
    valueOf() {
      return '1.1';
    },
  }, 1.1);
  check({
    valueOf() {
      return '1.1';
    },
    toString() {
      return '2.2';
    },
  }, 1.1);
  check({
    valueOf() {
      return '-0x1a2b3c';
    },
  }, NaN);
  check({
    toString() {
      return '-0x1a2b3c';
    },
  }, NaN);
  check({
    valueOf() {
      return 42;
    },
  }, 42);
  check({
    valueOf() {
      return '42';
    },
  }, 42);
  check({
    valueOf() {
      return null;
    },
  }, 0);
  check({
    toString() {
      return 42;
    },
  }, 42);
  check({
    toString() {
      return '42';
    },
  }, 42);
  check({
    valueOf() {
      return 1;
    },
    toString() {
      return 2;
    },
  }, 1);
  check({
    valueOf: 1,
    toString() {
      return 2;
    },
  }, 2);
  let number = 1;
  assert.same(Number({
    valueOf() {
      return ++number;
    },
  }), 2, 'Number call valueOf only once #1');
  assert.same(number, 2, 'Number call valueOf only once #2');
  number = 1;
  assert.same(Number({
    toString() {
      return ++number;
    },
  }), 2, 'Number call toString only once #1');
  assert.same(number, 2, 'Number call toString only once #2');
  number = 1;
  assert.same(new Number({
    valueOf() {
      return ++number;
    },
  }).valueOf(), 2, 'new Number call valueOf only once #1');
  assert.same(number, 2, 'new Number call valueOf only once #2');
  number = 1;
  assert.same(new Number({
    toString() {
      return ++number;
    },
  }).valueOf(), 2, 'new Number call toString only once #1');
  assert.same(number, 2, 'new Number call toString only once #2');
  assert.throws(() => Number(create(null)), TypeError, 'Number assert.throws on object w/o valueOf and toString');
  assert.throws(() => Number({
    valueOf: 1,
    toString: 2,
  }), TypeError, 'Number assert.throws on object then valueOf and toString are not functions');
  assert.throws(() => new Number(create(null)), TypeError, 'new Number assert.throws on object w/o valueOf and toString');
  assert.throws(() => new Number({
    valueOf: 1,
    toString: 2,
  }), TypeError, 'new Number assert.throws on object then valueOf and toString are not functions');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    const symbol = Symbol('Number constructor test');
    assert.throws(() => Number(symbol), 'throws on symbol argument');
    assert.throws(() => new Number(symbol), 'throws on symbol argument, new');
  }

  number = new Number(42);
  assert.same(typeof number.constructor(number), 'number');
  check(`${ whitespaces }42`, 42);
  check(`42${ whitespaces }`, 42);
  check(`${ whitespaces }42${ whitespaces }`, 42);
  check(`${ whitespaces }0x42`, 66);
  check(`0x42${ whitespaces }`, 66);
  check(`${ whitespaces }0x42${ whitespaces }`, 66);
  check(`${ whitespaces }0X42`, 66);
  check(`0X42${ whitespaces }`, 66);
  check(`${ whitespaces }0X42${ whitespaces }`, 66);
});

QUnit.test('Number constructor: binary', assert => {
  const check = getCheck(assert);
  check('0b1', 1);
  check('0B1', 1);
  check('0b12', NaN);
  check('0b234', NaN);
  check('0b1!', NaN);
  check('+0b1', NaN);
  check('-0b1', NaN);
  check(' 0b1', 1);
  check('0b1\n', 1);
  check('\n 0b1\n ', 1);
  check(' 0B1', 1);
  check('0B1\n', 1);
  check('\n 0B1\n ', 1);
  check({
    valueOf() {
      return '0b11';
    },
  }, 3);
  check({
    toString() {
      return '0b111';
    },
  }, 7);
  check({
    valueOf() {
      return '0b101010';
    },
  }, 42);
  check({
    toString() {
      return '0b101010';
    },
  }, 42);
  check(`${ whitespaces }0b11`, 3);
  check(`0b11${ whitespaces }`, 3);
  check(`${ whitespaces }0b11${ whitespaces }`, 3);
  check(`${ whitespaces }0B11`, 3);
  check(`0B11${ whitespaces }`, 3);
  check(`${ whitespaces }0B11${ whitespaces }`, 3);
});

QUnit.test('Number constructor: octal', assert => {
  const check = getCheck(assert);
  check('0o7', 7);
  check('0O7', 7);
  check('0o18', NaN);
  check('0o89a', NaN);
  check('0o1!', NaN);
  check('+0o1', NaN);
  check('-0o1', NaN);
  check(' 0o1', 1);
  check('0o1\n', 1);
  check('\n 0o1\n ', 1);
  check(' 0O1', 1);
  check('0O1\n', 1);
  check('\n 0O1\n ', 1);
  check({
    valueOf() {
      return '0o77';
    },
  }, 63);
  check({
    toString() {
      return '0o777';
    },
  }, 511);
  check({
    valueOf() {
      return '0o12345';
    },
  }, 5349);
  check({
    toString() {
      return '0o12345';
    },
  }, 5349);
  check(`${ whitespaces }0o11`, 9);
  check(`0o11${ whitespaces }`, 9);
  check(`${ whitespaces }0o11${ whitespaces }`, 9);
  check(`${ whitespaces }0O11`, 9);
  check(`0O11${ whitespaces }`, 9);
  check(`${ whitespaces }0O11${ whitespaces }`, 9);
});
