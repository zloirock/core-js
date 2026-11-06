import Promise from 'core-js-pure/es/promise';
import create from 'core-js-pure/es/object/create';
import ITERATOR from 'core-js-pure/es/symbol/iterator';
import ASYNC_ITERATOR from 'core-js-pure/es/symbol/async-iterator';

export function is(a, b) {
  // eslint-disable-next-line no-self-compare -- NaN check
  return a === b ? a !== 0 || 1 / a === 1 / b : a !== a && b !== b;
}

// null-proto copy of the expected object: `deepEqual` of a null-proto result against
// a plain literal is sensitive to prototype identity in some QUnit versions / realms
export function nullProto(source) {
  // plain copy loop: helpers run inside the unit-pure bundles too, where the modern
  // standard library must not be touched
  const result = create(null);
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) result[key] = source[key];
  }
  return result;
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

export const observableReturn = {
  returnCalls: 0,
  return() {
    this.returnCalls++;
    return { done: true, value: undefined };
  },
};

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
      return string !== undefined ? string : String(value);
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

export function createTypedArraySortCases() {
  const descending = [];
  const ascendingGroups = [];
  for (let i = 0; i < 516; i++) {
    descending.push(515 - i);
    ascendingGroups.push(i - 2 * (i % 4) + 3);
  }

  const keys = [0, 1, 0, 2, 1, 1, 2, 1, 0, 0];
  const input = [];
  const groups = [[], [], []];
  for (let i = 0; i < 520; i++) {
    const key = keys[Math.floor(i / 52)];
    // Encode the original position and sort key as an exact binary16 integer.
    const value = 3 * i + key;
    input.push(value);
    groups[key].push(value);
  }

  return [
    { input: descending, compare: (a, b) => (a / 4 | 0) - (b / 4 | 0), expected: ascendingGroups, label: 'stable #1' },
    { input, compare: (a, b) => b % 3 - a % 3, expected: groups[2].concat(groups[1], groups[0]), label: 'stable #2' },
  ];
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
  let timer;
  // losing the race does not disarm the timer, and in node an armed timer alone keeps the
  // process alive - the whole `time` is then spent idling after the suite is already done
  return Promise.race([
    typeof functionOrPromise == 'function' ? new Promise(functionOrPromise) : functionOrPromise,
    new Promise((resolve, reject) => {
      timer = setTimeout(reject, time);
    }),
  ]).then(result => {
    clearTimeout(timer);
    return result;
  }, error => {
    clearTimeout(timer);
    throw error;
  });
}

export function fromSource(source) {
  try {
    return Function(`return ${ source }`)();
  } catch { /* empty */ }
}

export function arrayToBuffer(array) {
  const { length } = array;
  const buffer = new ArrayBuffer(length);
  // eslint-disable-next-line es/no-typed-arrays -- safe
  const view = new DataView(buffer);
  for (let i = 0; i < length; ++i) {
    view.setUint8(i, array[i]);
  }
  return buffer;
}

export function bufferToArray(buffer) {
  const array = [];
  // eslint-disable-next-line es/no-typed-arrays -- safe
  const view = new DataView(buffer);
  for (let i = 0, { byteLength } = view; i < byteLength; ++i) {
    array.push(view.getUint8(i));
  }
  return array;
}
