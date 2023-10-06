import assign from 'core-js-pure/es/object/assign';
import create from 'core-js-pure/es/object/create';
import isIterable from 'core-js-pure/es/is-iterable';
import ASYNC_ITERATOR from 'core-js-pure/es/symbol/async-iterator';
import { is, arrayFromArrayLike } from './helpers.js';

// for Babel template transform
// eslint-disable-next-line es/no-object-create -- safe
if (!Object.create) Object.create = create;
// eslint-disable-next-line es/no-object-freeze -- safe
if (!Object.freeze) Object.freeze = Object;

// eslint-disable-next-line es/no-object-getownpropertydescriptor, es/no-object-getownpropertynames -- safe
const { getOwnPropertyDescriptor, getOwnPropertyNames } = Object;
const { toString, propertyIsEnumerable } = Object.prototype;

const { assert } = QUnit;

assign(assert, {
  arity(fn, length, message) {
    this.same(fn.length, length, message ?? `The arity of the function is ${ length }`);
  },
  arrayEqual(a, b, message) {
    this.deepEqual(arrayFromArrayLike(a), arrayFromArrayLike(b), message);
  },
  avoid(message = 'It should never be called') {
    this.ok(false, message);
  },
  // TODO: Drop from future `core-js` versions
  // available from `qunit@2.21`
  closeTo(actual, expected, delta, message) {
    if (typeof delta != 'number') throw new TypeError('closeTo() requires a delta argument');
    const result = Math.abs(actual - expected) <= delta;
    this.pushResult({
      result,
      actual,
      expected,
      message: message ?? `The value should be within ${ delta } inclusive`,
    });
  },
  enumerable(O, key, message) {
    const result = propertyIsEnumerable.call(O, key);
    this.pushResult({
      result,
      actual: result,
      expected: 'The property should be enumerable',
      message: message ?? `${ typeof key == 'symbol' ? 'property' : `'${ key }'` } is enumerable`,
    });
  },
  // TODO: Drop from future `core-js` versions
  // unavailable in `qunit@1` that's required for testing in IE9-, Chrome 38, etc.
  false(value, message = 'The value is `false`') {
    this.same(value, false, message);
  },
  isAsyncIterable(actual, message = 'The value is async iterable') {
    this.pushResult({
      result: typeof actual == 'object' && typeof actual[ASYNC_ITERATOR] == 'function',
      actual,
      expected: 'The value should be async iterable',
      message,
    });
  },
  isFunction(fn, message) {
    this.pushResult({
      result: typeof fn == 'function' || toString.call(fn).slice(8, -1) === 'Function',
      actual: typeof fn,
      expected: 'The value should be a function',
      message: message ?? 'The value is a function',
    });
  },
  isIterable(actual, message = 'The value is iterable') {
    this.pushResult({
      result: isIterable(actual),
      actual,
      expected: 'The value should be iterable',
      message,
    });
  },
  isIterator(actual, message = 'The object is an iterator') {
    this.pushResult({
      result: typeof actual == 'object' && typeof actual.next == 'function',
      actual,
      expected: 'The object should be an iterator',
      message,
    });
  },
  looksNative(fn, message = 'The function looks like a native') {
    const source = Function.prototype.toString.call(fn);
    this.pushResult({
      result: /native code/.test(source),
      actual: source,
      expected: 'The function should look like a native',
      message,
    });
  },
  name(fn, expected, message) {
    const applicable = typeof fn == 'function' && 'name' in fn;
    const actual = fn.name;
    this.pushResult({
      result: applicable ? actual === expected : true,
      actual,
      expected,
      message: applicable
        ? message ?? `The function name is '${ expected }'`
        : 'Function#name property test makes no sense',
    });
  },
  nonConfigurable(O, key, message) {
    const result = !getOwnPropertyDescriptor(O, key)?.configurable;
    this.pushResult({
      result,
      actual: result,
      expected: 'The property should be non-configurable',
      message: message ?? `${ typeof key == 'symbol' ? 'property' : `'${ key }'` } is non-configurable`,
    });
  },
  nonEnumerable(O, key, message) {
    const result = !propertyIsEnumerable.call(O, key);
    this.pushResult({
      result,
      actual: result,
      expected: 'The property should be non-enumerable',
      message: message ?? `${ typeof key == 'symbol' ? 'property' : `'${ key }'` } is non-enumerable`,
    });
  },
  nonWritable(O, key, message) {
    const result = !getOwnPropertyDescriptor(O, key)?.writable;
    this.pushResult({
      result,
      actual: result,
      expected: 'The property should be non-writable',
      message: message ?? `${ typeof key == 'symbol' ? 'property' : `'${ key }'` } is non-writable`,
    });
  },
  notSame(actual, expected, message) {
    this.pushResult({
      result: !is(actual, expected),
      actual,
      expected: 'Something different',
      message,
    });
  },
  notThrows(fn, message = 'Does not throw') {
    let result = false;
    let actual;
    try {
      actual = fn();
      result = true;
    } catch (error) {
      actual = error;
    }
    this.pushResult({
      result,
      actual,
      expected: 'It should not throw an error',
      message,
    });
  },
  required(message = 'It should be called') {
    this.ok(true, message);
  },
  same(actual, expected, message) {
    this.pushResult({
      result: is(actual, expected),
      actual,
      expected,
      message,
    });
  },
  // TODO: Drop from future `core-js` versions
  // unavailable in `qunit@1` that's required for testing in IE9-, Chrome 38, etc.
  true(value, message = 'The value is `true`') {
    this.same(value, true, message);
  },
});

// eslint-disable-next-line es/no-array-prototype-reduce -- safe
assert.skip = getOwnPropertyNames(assert).reduce((skip, method) => {
  skip[method] = () => { /* empty */ };
  return skip;
}, {});
