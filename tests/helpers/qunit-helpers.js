import { DESCRIPTORS, GLOBAL } from './constants';
import { is } from './helpers';

const { toString, propertyIsEnumerable } = Object.prototype.propertyIsEnumerable;

QUnit.assert.arity = function (fn, length, message) {
  this.pushResult({
    result: fn.length === length,
    actual: fn.length,
    expected: length,
    message: message || `arity is ${ length }`,
  });
};

QUnit.assert.arrayEqual = function (a, b, message) {
  let result = true;
  if (a.length !== b.length) {
    result = false;
  } else {
    for (let i = 0, { length } = a; i < length; ++i) {
      if (!is(a[i], b[i])) {
        result = false;
        break;
      }
    }
  }
  this.pushResult({
    result,
    actual: [].slice.call(a),
    expected: [].slice.call(b),
    message,
  });
};

QUnit.assert.epsilon = function (a, b, E, message) {
  this.pushResult({
    result: Math.abs(a - b) <= (E != null ? E : 1e-11),
    actual: a,
    expected: b,
    message,
  });
};

QUnit.assert.isFunction = function (fn, message) {
  this.pushResult({
    result: typeof fn === 'function' || toString.call(fn).slice(8, -1) === 'Function',
    actual: false,
    expected: true,
    message: message || 'is function',
  });
};

QUnit.assert.isIterable = function (it, message) {
  this.pushResult({
    // eslint-disable-next-line no-undef
    result: GLOBAL.core && core.isIterable ? core.isIterable(it) : !!it[GLOBAL.Symbol && Symbol.iterator],
    actual: false,
    expected: true,
    message: message || 'is iterable',
  });
};

QUnit.assert.isIterator = function (it, message) {
  this.pushResult({
    result: typeof it === 'object' && typeof it.next === 'function',
    actual: false,
    expected: true,
    message: message || 'is iterator',
  });
};

QUnit.assert.looksNative = function (fn, message) {
  this.pushResult({
    result: /native code/.test(Function.prototype.toString.call(fn)),
    actual: false,
    expected: true,
    message: message || 'looks native',
  });
};

QUnit.assert.name = function (fn, name, message) {
  this.pushResult({
    result: fn.name === name,
    actual: fn.name,
    expected: name,
    message: message || `name is '${ name }'`,
  });
};

QUnit.assert.nonEnumerable = function (O, key, message) {
  if (DESCRIPTORS) this.pushResult({
    result: !propertyIsEnumerable.call(O, key),
    actual: false,
    expected: true,
    message: message || `${ typeof key === 'symbol' ? 'method' : key } is non-enumerable`,
  });
};

QUnit.assert.notThrows = function (fn, message) {
  let throws, result, error;
  try {
    result = fn();
    throws = false;
  } catch (e) {
    throws = true;
    error = e;
  }
  this.pushResult({
    result: !throws && result,
    actual: throws ? error : result,
    expected: throws ? undefined : true,
    message: message || 'does not throw',
  });
};

QUnit.assert.same = function (a, b, message) {
  this.pushResult({
    result: is(a, b),
    actual: a,
    expected: b,
    message,
  });
};
