'use strict';
// var getBuiltInPrototypeMethod = require('../internals/get-built-in-prototype-method');
var $ = require('../internals/export');
var defineProperty = require('../internals/object-define-property').f
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

// TODO: properly use the polyfill for symbol.tostringtag
// section 1.2
// TODO: Temporal.Instant (8)
// TODO: Temporal.PlainDateTime (5)
// TODO: Temporal.PlainDate (3)
// TODO: Temporal.PlainTime (4)
// TODO: Temporal.PlainYearMonth (9)
// TODO: Temporal.PlainMonthDay (10)
// TODO: Temporal.Duration (7)
// TODO: Temporal.ZonedDateTime (6)
// section 1.3
// TODO: Temporal.Now (2)



var $Temporal = {};
defineProperty($Temporal, TO_STRING_TAG, {
  value: "Temporal",
  configurable: true
});


$({ global: true }, {
  Temporal: $Temporal
});