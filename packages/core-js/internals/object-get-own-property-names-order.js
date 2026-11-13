'use strict';
var fails = require('../internals/fails');

// Old V8 returns dictionary keys in hash table order.
module.exports = !fails(function () {
  var object = {};
  var alphabet = 'abcdefghijklmnopqrst';
  var index = 0;
  while (index < alphabet.length) object[alphabet.charAt(index)] = index++;
  // eslint-disable-next-line es/no-object-getownpropertynames -- required for testing
  return Object.getOwnPropertyNames(object).join('') !== alphabet;
});
