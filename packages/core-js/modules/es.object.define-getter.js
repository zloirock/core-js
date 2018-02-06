'use strict';
var toObject = require('core-js-internals/to-object');
var aFunction = require('core-js-internals/a-function');
var definePropertyModule = require('./_object-define-property');

// B.2.2.2 Object.prototype.__defineGetter__(P, getter)
if (require('core-js-internals/descriptors')) {
  require('./_export')({ target: 'Object', proto: true, forced: require('./_object-forced-pam') }, {
    __defineGetter__: function __defineGetter__(P, getter) {
      definePropertyModule.f(toObject(this), P, { get: aFunction(getter), enumerable: true, configurable: true });
    }
  });
}
