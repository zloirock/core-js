import Promise from 'core-js-pure/es/promise';
import ITERATOR from 'core-js-pure/features/symbol/iterator';

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

export function includes(target, wanted) {
  for (const element of target) if (wanted === element) return true;
  return false;
}

export function is(a, b) {
  // eslint-disable-next-line no-self-compare
  return a === b ? a !== 0 || 1 / a === 1 / b : a != a && b != b;
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
  } catch (e) { /* empty */ }
})();

export function timeLimitedPromise(time, fn) {
  return Promise.race([
    new Promise(fn), new Promise((resolve, reject) => {
      setTimeout(reject, time);
    }),
  ]);
}

// This function is used to force RegExp.prototype[Symbol.*] methods
// to not use the native implementation.
export function patchRegExp$exec(run) {
  return assert => {
    const originalExec = RegExp.prototype.exec;
    // eslint-disable-next-line no-extend-native
    RegExp.prototype.exec = function (...args) {
      return originalExec.apply(this, args);
    };
    try {
      return run(assert);
    } catch (e) {
      // In very old IE try / finally does not work without catch.
      throw e;
    } finally {
      // eslint-disable-next-line no-extend-native
      RegExp.prototype.exec = originalExec;
    }
  };
}
