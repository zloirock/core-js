import { GLOBAL } from './constants';

const { core } = GLOBAL;

const Promise = core ? core.Promise : GLOBAL.Promise;
const ArrayBuffer = core ? core.ArrayBuffer : GLOBAL.ArrayBuffer;
const DataView = core ? core.DataView : GLOBAL.DataView;

const ITERATOR = core ? core.Symbol.iterator : GLOBAL.Symbol && GLOBAL.Symbol.iterator;

export function arrayToBuffer(it) {
  const buffer = new ArrayBuffer(it.length);
  const view = new DataView(buffer);
  for (let i = 0, { length } = it; i < length; ++i) {
    view.setUint8(i, it[i]);
  }
  return buffer;
}

export function bufferToArray(it) {
  const results = [];
  const view = new DataView(it);
  for (let i = 0, { byteLength } = view; i < byteLength; ++i) {
    results.push(view.getUint8(i));
  }
  return results;
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
            done: index > elements.length
          };
        }
      };
      if (methods) for (const key in methods) iterator[key] = methods[key];
      return iterator;
    }
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
    })
  ]);
}
