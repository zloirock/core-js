'use strict';
var toObject = require('../internals/to-object');
var toPrimitive = require('../internals/to-primitive');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;

// `Object.prototype.__lookupGetter__` method
// https://tc39.github.io/ecma262/#sec-object.prototype.__lookupGetter__
if (require('../internals/descriptors')) {
  require('../internals/export')({ target: 'Object', proto: true, forced: require('../internals/object-forced-pam') }, {
    __lookupGetter__: function __lookupGetter__(P) {
      var O = toObject(this);
      var K = toPrimitive(P, true);
      var descriptor;
      do {
        if (descriptor = getOwnPropertyDescriptor(O, K)) return descriptor.get;
      } while (O = getPrototypeOf(O));
    }
  });
}
