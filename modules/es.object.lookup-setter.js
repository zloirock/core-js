'use strict';
var toObject = require('./_to-object');
var toPrimitive = require('./_to-primitive');
var getPrototypeOf = require('./_object-gpo');
var getOwnPropertyDescriptor = require('./_object-gopd').f;

// B.2.2.5 Object.prototype.__lookupSetter__(P)
if (require('./_descriptors')) {
  require('./_export')({ target: 'Object', proto: true, forced: require('./_object-forced-pam') }, {
    __lookupSetter__: function __lookupSetter__(P) {
      var O = toObject(this);
      var K = toPrimitive(P, true);
      var D;
      do {
        if (D = getOwnPropertyDescriptor(O, K)) return D.set;
      } while (O = getPrototypeOf(O));
    }
  });
}
