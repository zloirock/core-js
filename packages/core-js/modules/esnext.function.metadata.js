// type: proposals/decorator-metadata.d.ts
'use strict';
var wellKnownSymbol = require('../internals/well-known-symbol');

var METADATA = wellKnownSymbol('metadata');
var FunctionPrototype = Function.prototype;

// Function.prototype[@@metadata]
// https://github.com/tc39/proposal-decorator-metadata
if (FunctionPrototype[METADATA] === undefined) {
  Object.defineProperty(FunctionPrototype, METADATA, {
    value: null,
  });
}
