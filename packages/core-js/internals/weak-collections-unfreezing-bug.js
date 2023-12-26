'use strict';
var fails = require('../internals/fails');
// adding frozen arrays to weak collections in Chakra Edge unfreeze them
module.exports = fails(function () {
  var frozenArray = Object.freeze([]);
  new WeakMap().set(frozenArray, 1);
  // eslint-disable-next-line es/no-object-isfrozen -- safe
  return !Object.isFrozen(frozenArray);
});
