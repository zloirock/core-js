'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var defineProperty = require('../internals/object-define-property').f;
var fails = require('../internals/fails');
var uncurryThis = require('../internals/function-uncurry-this');
var uncurryThisAccessor = require('../internals/function-uncurry-this-accessor');

var RegExpPrototype = RegExp.prototype;
var getSource = uncurryThisAccessor(RegExpPrototype, 'source', 'get');
var toSource;

// Rhino accepts an own getter, and its native toSource still reads the current matcher after compile.
if (!getSource && DESCRIPTORS && !fails(function () {
  var re = /a/;
  defineProperty(re, 'source', { configurable: true, get: function () { return 'b'; } });
  // eslint-disable-next-line es/no-nonstandard-regexp-prototype-properties -- Rhino's native matcher
  toSource = uncurryThis(RegExpPrototype.toSource);
  return re.source !== 'b' || toSource(re) !== '/a/';
})) {
  var slice = uncurryThis(''.slice);
  var lastIndexOf = uncurryThis(''.lastIndexOf);
  getSource = function (re) {
    var literal = toSource(re);
    return slice(literal, 1, lastIndexOf(literal, '/'));
  };
}

module.exports = getSource;
