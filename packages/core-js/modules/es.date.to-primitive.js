var TO_PRIMITIVE = require('core-js-internals/well-known-symbol')('toPrimitive');
var DatePrototype = Date.prototype;

// `Date.prototype[@@toPrimitive]` method
// https://tc39.github.io/ecma262/#sec-date.prototype-@@toprimitive
if (!(TO_PRIMITIVE in DatePrototype)) require('./_hide')(DatePrototype, TO_PRIMITIVE, require('./_date-to-primitive'));
