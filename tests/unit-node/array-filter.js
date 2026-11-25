'use strict';
const assert = require('node:assert/strict');

// Load the two entries with fresh copies of the index check in this process.
delete Array.prototype.filter;
delete Object.setPrototypeOf;

const NativeString = String;
let conversions = 0;
globalThis.String = new Proxy(String, {
  apply(target, receiver, args) {
    if (typeof args[0] == 'number') conversions++;
    return Reflect.apply(target, receiver, args);
  },
});
const pureFilter = require('../../packages/core-js-pure/es/array/filter');

globalThis.String = NativeString;
conversions = 0;
const filtered = pureFilter([1, 0, 2], Boolean);
assert.equal(conversions, 0);
assert.deepEqual(filtered, [1, 2]);

Object.setPrototypeOf = function () { throw new TypeError('Prototype changes are disabled'); };
const filter = require('../../packages/core-js/es/array/filter');

assert.deepEqual(filter([1, 0, 2], Boolean), [1, 2]);
