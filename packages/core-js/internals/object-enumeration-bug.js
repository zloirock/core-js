'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');

// eslint-disable-next-line es/no-object-defineproperty -- required for testing
var defineProperty = Object.defineProperty;

// Rhino skips keys that become enumerable, and Edge can copy keys that become non-enumerable.
module.exports = function (METHOD_NAME) {
  var method = Object[METHOD_NAME];
  return !method || DESCRIPTORS && fails(function () {
    var read = '';
    var source = { a: 1, b: 2, c: 3 };
    defineProperty(source, 'b', { enumerable: false });
    defineProperty(source, 'a', { get: function () {
      defineProperty(source, 'b', { enumerable: true, get: function () { read += 'b'; } });
      defineProperty(source, 'c', { enumerable: false, get: function () { read += 'c'; } });
    } });
    if (METHOD_NAME === 'assign') method({}, source);
    else method(source);
    return read !== 'b';
  });
};
