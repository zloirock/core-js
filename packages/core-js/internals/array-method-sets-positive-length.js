'use strict';
var apply = require('../internals/function-apply');
var setPrototypeOf = require('../internals/object-set-prototype-of');
var wellKnownSymbol = require('../internals/well-known-symbol');

var SPECIES = wellKnownSymbol('species');

// whether a native array method gives the species constructor a count and its result a `length` that are +0 or
// positive, not -0 and not skipped. The receiver has an element: some V8 versions keep -0 only while elements follow
// the start. It gets `constructor` through its prototype: an own one would reset the V8 species protector.
module.exports = function (method, args) {
  var count;
  var Constructor = function () { /* empty */ };
  Constructor[SPECIES] = function (length) {
    count = length;
    return {};
  };
  var result = apply(method, setPrototypeOf([1], { constructor: Constructor }), args);
  return 1 / count > 0 && 1 / result.length > 0;
};
