import { DESCRIPTORS } from './constants';
import assign from 'core-js-pure/es/object/assign';
import isIterable from 'core-js-pure/es/is-iterable';
import ASYNC_ITERATOR from 'core-js-pure/es/symbol/async-iterator';
import { is, arrayFromArrayLike } from './helpers';

const { toString, propertyIsEnumerable } = Object.prototype.propertyIsEnumerable;

assign(QUnit.assert, {
  arity(fn, length, message) {
    this.same(fn.length, length, message ?? `The arity of the function is ${ length }`);
  },
  arrayEqual(a, b, message) {
    this.deepEqual(arrayFromArrayLike(a), arrayFromArrayLike(b), message);
  },
  enumerable(O, key, message) {
    const result = !DESCRIPTORS || propertyIsEnumerable.call(O, key);
    this.pushResult({
      result,
      actual: result,
      expected: 'The property should be enumerable',
      message: DESCRIPTORS
        ? 'Enumerability is not applicable'
        : message ?? `${ typeof key == 'symbol' ? 'property' : `'${ key }'` } is enumerable`,
    });
  },
  epsilon(a, b, EPSILON = 1e-11, message) {
    const result = Math.abs(a - b) <= EPSILON;
    this.pushResult({
      result,
      actual: result,
      expected: `The value should be closer to the target by less than ${ EPSILON }`,
      message: message ?? `The value should be closer to the target by less than ${ EPSILON }`,
    });
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
      expected: 'The function should looks like a native',
      message,
    });
  },
  name(fn, expected, message) {
    const applicable = typeof fn == 'function' && 'name' in fn;
    const result = applicable && fn.name === expected;
    this.pushResult({
      result,
      actual: result,
      expected,
      message: applicable
        ? message ?? `The function name is '${ result }'`
        : 'Function#name property test makes no sense',
    });
  },
  nonEnumerable(O, key, message) {
    const result = !DESCRIPTORS || !propertyIsEnumerable.call(O, key);
    this.pushResult({
      result,
      actual: result,
      expected: 'The property should be non-enumerable',
      message: DESCRIPTORS
        ? 'Enumerability is not applicable'
        : message ?? `${ typeof key == 'symbol' ? 'property' : `'${ key }'` } is non-enumerable`,
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
  same(actual, expected, message) {
    this.pushResult({
      result: is(actual, expected),
      actual,
      expected,
      message,
    });
  },
});
