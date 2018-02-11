var hide = require('../internals/hide');
var TO_PRIMITIVE = require('core-js-internals/well-known-symbol')('toPrimitive');
var dateToPrimitive = require('../internals/date-to-primitive');
var DatePrototype = Date.prototype;

// `Date.prototype[@@toPrimitive]` method
// https://tc39.github.io/ecma262/#sec-date.prototype-@@toprimitive
if (!(TO_PRIMITIVE in DatePrototype)) hide(DatePrototype, TO_PRIMITIVE, dateToPrimitive);
