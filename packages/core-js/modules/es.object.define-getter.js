'use strict';
var $ = require('../internals/export');
var FORCED = require('../internals/object-prototype-accessors-forced');
var toObject = require('../internals/to-object');
var aFunction = require('../internals/a-function');
var definePropertyModule = require('../internals/object-define-property');

// `Object.prototype.__defineGetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__defineGetter__
$({ target: 'Object', proto: true, forced: FORCED }, {
  __defineGetter__: function __defineGetter__(P, getter) {
    definePropertyModule.f(toObject(this), P, { get: aFunction(getter), enumerable: true, configurable: true });
  }
});
