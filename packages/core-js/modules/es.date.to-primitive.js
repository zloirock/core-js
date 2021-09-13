var redefine = require('../internals/redefine');
var dateToPrimitive = require('../internals/date-to-primitive');
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
var DatePrototype = Date.prototype;

// `Date.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
if (!(TO_PRIMITIVE in DatePrototype)) {
  redefine(DatePrototype, TO_PRIMITIVE, dateToPrimitive);
}
