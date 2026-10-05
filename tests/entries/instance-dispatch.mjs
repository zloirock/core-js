// Generated dispatch entries retain one inherited method read and replace only a native or missing method.
import { strictEqual } from 'node:assert/strict';
import arrayMethod from '@core-js/pure/es/array/instance/at';
import genericMethod from '@core-js/pure/es/instance/at';
import entriesMethod from '@core-js/pure/actual/instance/entries';
import numberMethod from '@core-js/pure/es/number/instance/to-fixed';
import stringMethod from '@core-js/pure/es/string/instance/repeat';
import functionMethod from '@core-js/pure/full/instance/demethodize';
import arrayAt from '@core-js/pure/es/array/prototype/at';
import stringAt from '@core-js/pure/es/string/prototype/at';
import arrayEntries from '@core-js/pure/actual/array/prototype/entries';
import numberToFixed from '@core-js/pure/es/number/prototype/to-fixed';
import stringRepeat from '@core-js/pure/es/string/prototype/repeat';
import functionDemethodize from '@core-js/pure/full/function/prototype/demethodize';
import { restoreProperty } from '../helpers/restore-property.cjs';

for (const [lookup, entry, key] of [
  [arrayMethod, 'es/array/instance/at', 'at'],
  [genericMethod, 'es/instance/at', 'at'],
  [entriesMethod, 'actual/instance/entries', 'entries'],
]) {
  const previous = Object.getOwnPropertyDescriptor(Array.prototype, key);
  let reads = 0;
  function selected() { return 'held'; }
  try {
    // eslint-disable-next-line no-extend-native -- verifies the generated entry against a temporary getter
    Object.defineProperty(Array.prototype, key, {
      configurable: true,
      get() {
        reads++;
        return reads === 1 ? selected : function () { return 'later'; };
      },
    });
    strictEqual(lookup([]), selected, `${ entry } dispatch keeps the first method`);
    strictEqual(reads, 1, `${ entry } dispatch reads the inherited method once`);
  } finally {
    restoreProperty(Array.prototype, key, previous);
  }
}

const nativeCases = [
  [arrayMethod, 'es/array/instance/at', 'at', Array.prototype],
  [genericMethod, 'es/instance/at, array arm', 'at', Array.prototype],
  [genericMethod, 'es/instance/at, string arm', 'at', String.prototype],
  [entriesMethod, 'actual/instance/entries', 'entries', Array.prototype],
  [numberMethod, 'es/number/instance/to-fixed', 'toFixed', Number.prototype],
  [stringMethod, 'es/string/instance/repeat', 'repeat', String.prototype],
];

for (const [lookup, entry, key, prototype] of nativeCases) {
  const parent = Object.create(prototype);
  Object.defineProperty(parent, key, { value: undefined });
  const receiver = Object.create(parent);
  strictEqual(lookup(receiver), undefined, `${ entry } keeps an inherited undefined override`);
  const proxy = new Proxy(receiver, {
    getOwnPropertyDescriptor() { throw new Error('unexpected receiver descriptor trap'); },
  });
  strictEqual(lookup(proxy), undefined, `${ entry } does not inspect the receiver descriptor`);
  const previous = Object.getOwnPropertyDescriptor(prototype, key);
  try {
    delete prototype[key];
    strictEqual(typeof lookup(Object.create(prototype)), 'function', `${ entry } retains its missing-method fallback`);
  } finally {
    restoreProperty(prototype, key, previous);
  }
}

for (const [lookup, entry, key, prototype] of [
  ...nativeCases,
  [functionMethod, 'full/instance/demethodize', 'demethodize', Function.prototype],
]) {
  const previous = Object.getOwnPropertyDescriptor(prototype, key);
  const inheritedReceiver = Object.create(prototype);
  let receiverReads = 0;
  function selected() { return 'held'; }
  try {
    Object.defineProperty(prototype, key, {
      configurable: true,
      get() {
        receiverReads++;
        return selected;
      },
    });
    strictEqual(lookup(inheritedReceiver), selected, `${ entry } keeps the accessor's method`);
    strictEqual(receiverReads, 1, `${ entry } reads the receiver method once`);
  } finally {
    restoreProperty(prototype, key, previous);
  }
}

function receiverWith(prototype, key, descriptor) {
  return Object.defineProperty(Object.create(prototype), key, descriptor);
}

// A key defined below the prototype, own or inherited, is the receiver's value, `undefined` included
function checkDefinedKeys({ lookup, entry, key, prototype, state }) {
  function own() { return 'own'; }
  let reads = 0;
  const ownUndefined = receiverWith(prototype, key, { value: undefined });
  strictEqual(lookup(ownUndefined), undefined, `${ entry } keeps an own undefined ${ state }`);
  const ownGetter = receiverWith(prototype, key, {
    get() {
      reads++;
      return undefined;
    },
  });
  strictEqual(lookup(ownGetter), undefined, `${ entry } keeps an own undefined getter ${ state }`);
  strictEqual(reads, 1, `${ entry } reads the own getter once ${ state }`);
  strictEqual(lookup(Object.create(ownUndefined)), undefined, `${ entry } keeps an inherited undefined ${ state }`);
  strictEqual(lookup(receiverWith(prototype, key, { value: own })), own, `${ entry } keeps an own method ${ state }`);
  const presenceGuarded = new Proxy(receiverWith(prototype, key, { value: own }), {
    has() { throw new Error('unexpected receiver has trap'); },
  });
  strictEqual(lookup(presenceGuarded), own, `${ entry } decides a defined method without a presence check ${ state }`);
}

for (const [lookup, polyfill, entry, key, prototype] of [
  [arrayMethod, arrayAt, 'es/array/instance/at', 'at', Array.prototype],
  [genericMethod, arrayAt, 'es/instance/at, array arm', 'at', Array.prototype],
  [genericMethod, stringAt, 'es/instance/at, string arm', 'at', String.prototype],
  [entriesMethod, arrayEntries, 'actual/instance/entries', 'entries', Array.prototype],
  [numberMethod, numberToFixed, 'es/number/instance/to-fixed', 'toFixed', Number.prototype],
  [stringMethod, stringRepeat, 'es/string/instance/repeat', 'repeat', String.prototype],
  [functionMethod, functionDemethodize, 'full/instance/demethodize', 'demethodize', Function.prototype],
]) {
  const previous = Object.getOwnPropertyDescriptor(prototype, key);
  if (previous) checkDefinedKeys({ lookup, entry, key, prototype, state: 'beside a defined method' });
  try {
    delete prototype[key];
    strictEqual(lookup(Object.create(prototype)), polyfill, `${ entry } falls back on a missing method`);
    checkDefinedKeys({ lookup, entry, key, prototype, state: 'over a missing method' });
    const foreign = prototype === Number.prototype ? 'ab' : 1;
    strictEqual(lookup(foreign), foreign[key], `${ entry } leaves a foreign primitive to its own lookup`);
    Object.defineProperty(prototype, key, { configurable: true, value: undefined });
    strictEqual(lookup(Object.create(prototype)), polyfill, `${ entry } falls back on an undefined prototype slot`);
  } finally {
    restoreProperty(prototype, key, previous);
  }
}

// A DOM collection is judged by its own chain, not by Array.prototype - either may lack the method
for (const tag of ['DOMTokenList', 'NodeList']) {
  const collection = Object.defineProperty({}, Symbol.toStringTag, { value: tag });
  const entry = `actual/instance/entries on ${ tag }`;
  const previous = Object.getOwnPropertyDescriptor(Array.prototype, 'entries');
  strictEqual(entriesMethod(Object.create(collection)), arrayEntries, `${ entry } falls back on a missing method`);
  checkDefinedKeys({ lookup: entriesMethod, entry, key: 'entries', prototype: collection, state: 'beside a defined array method' });
  try {
    delete Array.prototype.entries;
    strictEqual(entriesMethod(Object.create(collection)), arrayEntries, `${ entry } falls back on a missing array method`);
    checkDefinedKeys({ lookup: entriesMethod, entry, key: 'entries', prototype: collection, state: 'over a missing array method' });
  } finally {
    restoreProperty(Array.prototype, 'entries', previous);
  }
}
