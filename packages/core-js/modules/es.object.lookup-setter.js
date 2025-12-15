// types: annex-b/object-prototype-accessor-methods
'use strict';
var $ = require('../internals/export');
var FORCED = require('../internals/object-prototype-accessors-forced');
var toObject = require('../internals/to-object');
var toPropertyKey = require('../internals/to-property-key');

var getPrototypeOf = Object.getPrototypeOf;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.prototype.__lookupSetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__lookupSetter__
$({ target: 'Object', proto: true, forced: FORCED }, {
  __lookupSetter__: function __lookupSetter__(P) {
    var O = toObject(this);
    var key = toPropertyKey(P);
    var desc;
    do {
      if (desc = getOwnPropertyDescriptor(O, key)) return desc.set;
    } while (O = getPrototypeOf(O));
  },
});
