'use strict';
var setPrototypeOf = require('../internals/object-set-prototype-of');

var getPrototypeOf = Object.getPrototypeOf;

// makes subclassing work correct for wrapped built-ins
module.exports = function ($this, dummy, basePrototype) {
  var dummyPrototype = getPrototypeOf(dummy);
  if (dummyPrototype !== basePrototype) setPrototypeOf($this, dummyPrototype);
  return $this;
};
