'use strict';
var V8_PROTOTYPE_DEFINE_BUG = require('../internals/v8-prototype-define-bug');
var definePropertyModule = require('../internals/object-define-property');
var anObject = require('../internals/an-object');
var toObject = require('../internals/to-object');

var objectKeys = Object.keys;

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
exports.f = V8_PROTOTYPE_DEFINE_BUG ? function defineProperties(O, Properties) {
  anObject(O);
  var props = toObject(Properties);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule.f(O, key = keys[index++], props[key]);
  return O;
} : Object.defineProperties;
