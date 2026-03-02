'use strict';
var classof = require('../internals/classof-raw');
var isNullOrUndefined = require('../internals/is-null-or-undefined');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');
var $Object = Object;

module.exports = function (it) {
  if (isNullOrUndefined(it)) return false;
  var O = $Object(it);
  return O[ITERATOR] !== undefined || classof(O) === 'Arguments';
};
