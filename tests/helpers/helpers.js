import Promise from '@core-js/pure/es/promise';
import ITERATOR from '@core-js/pure/es/symbol/iterator';
import ASYNC_ITERATOR from '@core-js/pure/es/symbol/async-iterator';

export function is(a, b) {
  // eslint-disable-next-line no-self-compare -- NaN check
  return a === b ? a !== 0 || 1 / a === 1 / b : a !== a && b !== b;
}

export function createIterator(elements, methods) {
  let index = 0;
  const iterator = {
    called: false,
    next() {
      iterator.called = true;
      return {
        value: elements[index++],
        done: index > elements.length,
      };
    },
  };
  if (methods) for (const key in methods) iterator[key] = methods[key];
  return iterator;
}

export function createSetLike(elements) {
  return {
    size: elements.length,
    has(it) {
      return includes(elements, it);
    },
    keys() {
      return createIterator(elements);
    },
  };
}

export function createIterable(elements, methods) {
  const iterable = {
    called: false,
    received: false,
    [ITERATOR]() {
      iterable.received = true;
      let index = 0;
      const iterator = {
        next() {
          iterable.called = true;
          return {
            value: elements[index++],
            done: index > elements.length,
          };
        },
      };
      if (methods) for (const key in methods) iterator[key] = methods[key];
      return iterator;
    },
  };
  return iterable;
}

export function createAsyncIterable(elements, methods) {
  const iterable = {
    called: false,
    received: false,
    [ASYNC_ITERATOR]() {
      iterable.received = true;
      let index = 0;
      const iterator = {
        next() {
          iterable.called = true;
          return Promise.resolve({
            value: elements[index++],
            done: index > elements.length,
          });
        },
      };
      if (methods) for (const key in methods) iterator[key] = methods[key];
      return iterator;
    },
  };
  return iterable;
}

export function createConversionChecker(value, string) {
  const checker = {
    $valueOf: 0,
    $toString: 0,
    valueOf() {
      checker.$valueOf++;
      return value;
    },
    toString() {
      checker.$toString++;
      return arguments.length > 1 ? string : String(value);
    },
  };

  return checker;
}

export function arrayFromArrayLike(source) {
  const { length } = source;
  const result = Array(length);
  for (let index = 0; index < length; index++) {
    result[index] = source[index];
  } return result;
}

export function includes(target, wanted) {
  for (const element of target) if (wanted === element) return true;
  return false;
}

export const nativeSubclass = (() => {
  try {
    if (Function(`
      'use strict';
      class Subclass extends Object { /* empty */ };
      return new Subclass() instanceof Subclass;
    `)()) return Function('Parent', `
      'use strict';
      return class extends Parent { /* empty */ };
    `);
  } catch { /* empty */ }
})();

export function timeLimitedPromise(time, functionOrPromise) {
  return Promise.race([
    typeof functionOrPromise == 'function' ? new Promise(functionOrPromise) : functionOrPromise,
    new Promise((resolve, reject) => {
      setTimeout(reject, time);
    }),
  ]);
}

// This function is used to force RegExp.prototype[Symbol.*] methods
// to not use the native implementation.
export function patchRegExp$exec(run) {
  return assert => {
    const originalExec = RegExp.prototype.exec;
    // eslint-disable-next-line no-extend-native -- required for testing
    RegExp.prototype.exec = function (...args) {
      return originalExec.apply(this, args);
    };
    try {
      return run(assert);
    // eslint-disable-next-line no-useless-catch -- in very old IE try / finally does not work without catch
    } catch (error) {
      throw error;
    } finally {
      // eslint-disable-next-line no-extend-native -- required for testing
      RegExp.prototype.exec = originalExec;
    }
  };
}

export function fromSource(source) {
  try {
    return Function(`return ${ source }`)();
  } catch { /* empty */ }
}

export function arrayToBuffer(array) {
  const { length } = array;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  for (let i = 0; i < length; ++i) {
    view.setUint8(i, array[i]);
  }
  return buffer;
}

export function bufferToArray(buffer) {
  const array = [];
  const view = new DataView(buffer);
  for (let i = 0, { byteLength } = view; i < byteLength; ++i) {
    array.push(view.getUint8(i));
  }
  return array;
}
