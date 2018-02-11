'use strict';
var toObject = require('core-js-internals/to-object');
var aFunction = require('core-js-internals/a-function');
var definePropertyModule = require('../internals/object-define-property');

// `Object.prototype.__defineGetter__` method
// https://tc39.github.io/ecma262/#sec-object.prototype.__defineGetter__
if (require('core-js-internals/descriptors')) {
  require('../internals/export')({ target: 'Object', proto: true, forced: require('../internals/object-forced-pam') }, {
    __defineGetter__: function __defineGetter__(P, getter) {
      definePropertyModule.f(toObject(this), P, { get: aFunction(getter), enumerable: true, configurable: true });
    }
  });
}
