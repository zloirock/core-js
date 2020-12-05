'use strict';
var addToUnscopables = require('../internals/add-to-unscopables');
var toObject = require('../internals/to-object');
var toLength = require('../internals/to-length');

// `Array.prototype.lastIndex` accessor
// https://github.com/keithamus/proposal-array-last
if (!('lastItem' in [])) {
  Object.defineProperty(Array.prototype, 'lastItem', {
    configurable: true,
    get: function lastItem() {
      var O = toObject(this);
      var len = toLength(O.length);
      return len == 0 ? undefined : O[len - 1];
    },
    set: function lastItem(value) {
      var O = toObject(this);
      var len = toLength(O.length);
      O[len == 0 ? 0 : len - 1] = value;
    },
  });

  addToUnscopables('lastItem');
}
