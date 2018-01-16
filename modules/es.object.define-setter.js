'use strict';
var toObject = require('./_to-object');
var aFunction = require('./_a-function');
var $defineProperty = require('./_object-dp');

// B.2.2.3 Object.prototype.__defineSetter__(P, setter)
if (require('./_descriptors')) {
  require('./_export')({ target: 'Object', proto: true, forced: require('./_object-forced-pam') }, {
    __defineSetter__: function __defineSetter__(P, setter) {
      $defineProperty.f(toObject(this), P, { set: aFunction(setter), enumerable: true, configurable: true });
    }
  });
}
