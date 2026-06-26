'use strict';
var toNumber = require('./to-number');

var $isNaN = isNaN;
var abs = Math.abs;
var floor = Math.floor;
var MOD = 0x100000000;

// WebIDL Unsigned Long
module.exports = function toUnsignedLong(value) {
  value = toNumber(value);
  // Normalize -0
  if (value === 0) value = 0;
  if ($isNaN(value) || value === Infinity || value === -Infinity) return 0;
  var r = floor(abs(value));
  if (value < 0) r = -r;
  value = r;
  value = ((value % MOD) + MOD) % MOD;
  return value;
};
