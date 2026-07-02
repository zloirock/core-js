'use strict';
var fails = require('../internals/fails');
var createPropertyDescriptor = require('../internals/create-property-descriptor');

module.exports = !fails(function () {
  var error = new Error('a');
  if (!('stack' in error)) return true;
  Object.defineProperty(error, 'stack', createPropertyDescriptor(1, 7));
  return error.stack !== 7;
});
