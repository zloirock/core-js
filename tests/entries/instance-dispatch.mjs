// Generated dispatch entries retain one inherited method read.
import { strictEqual } from 'node:assert/strict';
import arrayMethod from '@core-js/pure/es/array/instance/at';
import genericMethod from '@core-js/pure/es/instance/at';
import entriesMethod from '@core-js/pure/actual/instance/entries';
import numberMethod from '@core-js/pure/es/number/instance/to-fixed';
import stringMethod from '@core-js/pure/es/string/instance/repeat';
import functionMethod from '@core-js/pure/full/instance/demethodize';
import { restoreProperty } from '../helpers/restore-property.cjs';

for (const [lookup, key] of [
  [arrayMethod, 'at'],
  [genericMethod, 'at'],
  [entriesMethod, 'entries'],
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
    strictEqual(lookup([]), selected, `${ key } dispatch keeps the first method`);
    strictEqual(reads, 1, `${ key } dispatch reads the inherited method once`);
  } finally {
    restoreProperty(Array.prototype, key, previous);
  }
}

const nativeCases = [
  [arrayMethod, 'es/array/instance/at', 'at', Array.prototype],
  [genericMethod, 'es/instance/at', 'at', Array.prototype],
  [genericMethod, 'es/instance/at', 'at', String.prototype],
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
