'use strict';
var createProperty = require('./_create-property');

// `Array.of` method
// https://tc39.github.io/ecma262/#sec-array.of
// WebKit Array.of isn't generic
require('./_export')({ target: 'Array', stat: true, forced: require('core-js-internals/fails')(function () {
  function F() { /* empty */ }
  return !(Array.of.call(F) instanceof F);
}) }, {
  of: function of(/* ...args */) {
    var index = 0;
    var argumentsLength = arguments.length;
    var result = new (typeof this == 'function' ? this : Array)(argumentsLength);
    while (argumentsLength > index) createProperty(result, index, arguments[index++]);
    result.length = argumentsLength;
    return result;
  }
});
