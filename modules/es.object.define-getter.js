'use strict';
var toObject = require('./_to-object');
var aFunction = require('./_a-function');
var $defineProperty = require('./_object-dp');

// B.2.2.2 Object.prototype.__defineGetter__(P, getter)
if (require('./_descriptors')) {
  require('./_export')({ target: 'Object', proto: true, forced: require('./_object-forced-pam') }, {
    __defineGetter__: function __defineGetter__(P, getter) {
      $defineProperty.f(toObject(this), P, { get: aFunction(getter), enumerable: true, configurable: true });
    }
  });
}
