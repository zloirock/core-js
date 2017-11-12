import { nativeSubclass } from '../helpers/helpers';
var ws = ' \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000';

function getCheck(assert) {
  return function (a, b) {
    var x;
    assert.same(Number(a), b, 'Number ' + typeof a + ' ' + a + ' -> ' + b);
    x = new Number(a);
    assert.ok(x === Object(x), 'new Number ' + typeof a + ' ' + a + ' is object');
    assert.strictEqual({}.toString.call(x).slice(8, -1), 'Number', 'classof new Number ' + typeof a + ' ' + a + ' is Number');
    assert.same(x.valueOf(), b, 'new Number(' + typeof a + ' ' + a + ').valueOf() -> ' + b);
  };
}

QUnit.test('Number constructor: regression', function (assert) {
  var check = getCheck(assert);
  assert.isFunction(Number);
  assert.arity(Number, 1);
  assert.name(Number, 'Number');
  assert.looksNative(Number);
  assert.same(Number.prototype.constructor, Number);
  assert.same(1.0.constructor, Number);
  var constants = ['MAX_VALUE', 'MIN_VALUE', 'NaN', 'NEGATIVE_INFINITY', 'POSITIVE_INFINITY'];
  for (var i = 0, length = constants.length; i < length; ++i) {
    var constant = constants[i];
    assert.ok(constant in Number, 'Number.' + constant);
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
    valueOf: '1.1'
  }, NaN);
  check({
    valueOf: '1.1',
    toString: function () {
      return '2.2';
    }
  }, 2.2);
  check({
    valueOf: function () {
      return '1.1';
    }
  }, 1.1);
  check({
    valueOf: function () {
      return '1.1';
    },
    toString: function () {
      return '2.2';
    }
  }, 1.1);
  check({
    valueOf: function () {
      return '-0x1a2b3c';
    }
  }, NaN);
  check({
    toString: function () {
      return '-0x1a2b3c';
    }
  }, NaN);
  check({
    valueOf: function () {
      return 42;
    }
  }, 42);
  check({
    valueOf: function () {
      return '42';
    }
  }, 42);
  check({
    valueOf: function () {
      return null;
    }
  }, 0);
  check({
    toString: function () {
      return 42;
    }
  }, 42);
  check({
    toString: function () {
      return '42';
    }
  }, 42);
  check({
    valueOf: function () {
      return 1;
    },
    toString: function () {
      return 2;
    }
  }, 1);
  check({
    valueOf: 1,
    toString: function () {
      return 2;
    }
  }, 2);
  var number = 1;
  assert.strictEqual(Number({
    valueOf: function () {
      return ++number;
    }
  }), 2, 'Number call valueOf only once #1');
  assert.strictEqual(number, 2, 'Number call valueOf only once #2');
  number = 1;
  assert.strictEqual(Number({
    toString: function () {
      return ++number;
    }
  }), 2, 'Number call toString only once #1');
  assert.strictEqual(number, 2, 'Number call toString only once #2');
  number = 1;
  assert.strictEqual(new Number({
    valueOf: function () {
      return ++number;
    }
  }).valueOf(), 2, 'new Number call valueOf only once #1');
  assert.strictEqual(number, 2, 'new Number call valueOf only once #2');
  number = 1;
  assert.strictEqual(new Number({
    toString: function () {
      return ++number;
    }
  }).valueOf(), 2, 'new Number call toString only once #1');
  assert.strictEqual(number, 2, 'new Number call toString only once #2');
  assert['throws'](function () {
    return Number(Object.create(null));
  }, TypeError, 'Number assert.throws on object w/o valueOf and toString');
  assert['throws'](function () {
    return Number({
      valueOf: 1,
      toString: 2
    });
  }, TypeError, 'Number assert.throws on object then valueOf and toString are not functions');
  assert['throws'](function () {
    return new Number(Object.create(null));
  }, TypeError, 'new Number assert.throws on object w/o valueOf and toString');
  assert['throws'](function () {
    return new Number({
      valueOf: 1,
      toString: 2
    });
  }, TypeError, 'new Number assert.throws on object then valueOf and toString are not functions');
  number = new Number(42);
  assert.strictEqual(typeof number.constructor(number), 'number');
  check(ws + '42', 42);
  check('42' + ws, 42);
  check(ws + '42' + ws, 42);
  check(ws + '0x42', 66);
  check('0x42' + ws, 66);
  check(ws + '0x42' + ws, 66);
  check(ws + '0X42', 66);
  check('0X42' + ws, 66);
  check(ws + '0X42' + ws, 66);
  if (nativeSubclass) {
    var Subclass = nativeSubclass(Number);
    assert.ok(new Subclass() instanceof Subclass, 'correct subclassing with native classes #1');
    assert.ok(new Subclass() instanceof Number, 'correct subclassing with native classes #2');
    assert.same(new Subclass(1).toFixed(2), '1.00', 'correct subclassing with native classes #3');
  }
});

QUnit.test('Number constructor: binary', function (assert) {
  var check = getCheck(assert);
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
    valueOf: function () {
      return '0b11';
    }
  }, 3);
  check({
    toString: function () {
      return '0b111';
    }
  }, 7);
  check({
    valueOf: function () {
      return '0b101010';
    }
  }, 42);
  check({
    toString: function () {
      return '0b101010';
    }
  }, 42);
  check(ws + '0b11', 3);
  check('0b11' + ws, 3);
  check(ws + '0b11' + ws, 3);
  check(ws + '0B11', 3);
  check('0B11' + ws, 3);
  check(ws + '0B11' + ws, 3);
});

QUnit.test('Number constructor: octal', function (assert) {
  var check = getCheck(assert);
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
    valueOf: function () {
      return '0o77';
    }
  }, 63);
  check({
    toString: function () {
      return '0o777';
    }
  }, 511);
  check({
    valueOf: function () {
      return '0o12345';
    }
  }, 5349);
  check({
    toString: function () {
      return '0o12345';
    }
  }, 5349);
  check(ws + '0o11', 9);
  check('0o11' + ws, 9);
  check(ws + '0o11' + ws, 9);
  check(ws + '0O11', 9);
  check('0O11' + ws, 9);
  check(ws + '0O11' + ws, 9);
});
