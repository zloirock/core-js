'use strict';
var $ = require('../internals/export');
var FORCED = require('../internals/object-prototype-accessors-forced');
var toObject = require('../internals/to-object');
var toPrimitive = require('../internals/to-primitive');
var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');

// eslint-disable-next-line es/no-object-getprototypeof -- safe
var getPrototypeOf = Object.getPrototypeOf;

// `Object.prototype.__lookupGetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__lookupGetter__
$({ target: 'Object', proto: true, forced: FORCED }, {
  __lookupGetter__: function __lookupGetter__(P) {
    var O = toObject(this);
    var key = toPrimitive(P, true);
    var desc;
    do {
      if (desc = getOwnPropertyDescriptorModule.f(O, key)) return desc.get;
    } while (O = getPrototypeOf(O));
  },
});
