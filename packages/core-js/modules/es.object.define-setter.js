'use strict';
var $ = require('../internals/export');
var FORCED = require('../internals/object-prototype-accessors-forced');
var toObject = require('../internals/to-object');
var aFunction = require('../internals/a-function');
var definePropertyModule = require('../internals/object-define-property');

// `Object.prototype.__defineSetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__defineSetter__
$({ target: 'Object', proto: true, forced: FORCED }, {
  __defineSetter__: function __defineSetter__(P, setter) {
    definePropertyModule.f(toObject(this), P, { set: aFunction(setter), enumerable: true, configurable: true });
  }
});
