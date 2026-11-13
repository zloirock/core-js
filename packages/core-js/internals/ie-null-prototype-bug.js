'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');

// TODO: remove in core-js@4
// IE10 cannot get descriptors of integer keys on some null-prototype objects.
module.exports = DESCRIPTORS && fails(function () {
  // eslint-disable-next-line es/no-object-create -- required for testing
  var object = Object.create(null);
  object[2] = 2;
  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- required for testing
  return !Object.getOwnPropertyDescriptor(object, 2);
});
