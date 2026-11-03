'use strict';
var fails = require('../internals/fails');
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var WEBKIT_VERSION = require('../internals/environment-webkit-version');

// Safari 14 / iOS 14 JSC can accept primitive iterator results after warming up.
// Both Array.from and %TypedArray%.from use the affected for-of implementation.
// Exclude Blink's frozen AppleWebKit/537.36 UA, then detect the older JSC
// generation by its shared throwing caller / arguments accessor.
// Safari 15+ and Bun have separate accessors. Read descriptors without invoking them.
module.exports = WEBKIT_VERSION > 537 && !fails(function () {
  var prototype = Function.prototype;
  var caller = getOwnPropertyDescriptor(prototype, 'caller');
  var args = getOwnPropertyDescriptor(prototype, 'arguments');
  return !caller || !args || typeof caller.get != 'function' || caller.get !== args.get;
});
