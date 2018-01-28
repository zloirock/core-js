'use strict';
var toObject = require('core-js-internals/to-object');
var aFunction = require('core-js-internals/a-function');
var $defineProperty = require('./_object-dp');

// B.2.2.3 Object.prototype.__defineSetter__(P, setter)
if (require('core-js-internals/descriptors')) {
  require('./_export')({ target: 'Object', proto: true, forced: require('./_object-forced-pam') }, {
    __defineSetter__: function __defineSetter__(P, setter) {
      $defineProperty.f(toObject(this), P, { set: aFunction(setter), enumerable: true, configurable: true });
    }
  });
}
